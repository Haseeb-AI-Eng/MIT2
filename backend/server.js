import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

import dns from "dns";
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import zlib from "zlib";
import { MongoClient, ObjectId } from "mongodb";
import twilio from "twilio";

let scrapeAll;
let startCronJob;

async function loadScraperModule() {
  if (scrapeAll && startCronJob) return;
  ({ scrapeAll, startCronJob } = await import("./scraper.js"));
}

// ---- In-memory cache ----
const _cache = new Map();
const CACHE_TTL_MS = 5 * 60_000; // ✅ 5 minutes (was 30s)

function cacheGet(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    _cache.delete(key);
    return null;
  }
  return entry.data;
}
function cacheSet(key, data) {
  _cache.set(key, { data, ts: Date.now() });
}
function cacheInvalidate(prefix) {
  for (const k of _cache.keys()) {
    if (k.startsWith(prefix)) _cache.delete(k);
  }
}

// ---- Gzip middleware ----
function gzipResponse(req, res, next) {
  const acceptEncoding = req.headers["accept-encoding"] || "";
  if (!acceptEncoding.includes("gzip")) return next();
  const origJson = res.json.bind(res);
  res.json = function (data) {
    const body = Buffer.from(JSON.stringify(data), "utf8");
    zlib.gzip(body, (err, compressed) => {
      if (err) {
        return origJson(data);
      }
      res.setHeader("Content-Encoding", "gzip");
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Content-Length", compressed.length);
      res.end(compressed);
    });
  };
  next();
}

const PORT = process.env.PORT;
if (!PORT) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI environment variable is required.");
}
const DB_NAME = process.env.DB_NAME || "research";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required.");
}
const REPLIT_DOMAIN = (process.env.REPLIT_DOMAINS || "").split(",")[0].trim();
const API_BASE_URL =
  process.env.API_BASE_URL ||
  (REPLIT_DOMAIN ? `https://${REPLIT_DOMAIN}` : `http://localhost:${PORT}`);

const app = express();
app.use(cors());
app.use(gzipResponse);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

let usersCollection;
let projectsCollection;
let projectMembersCollection;
let labsCollection;
let articlesCollection;
let tagsCollection;
let formSubmissionsCollection;
let announcementsCollection;
let projectViewsCollection;

const USER_ROLES = ["admin", "researcher", "student"];
const PROJECT_STATUSES = ["draft", "review", "published"];

// ---- Default admin seeding ----
// Single atomic upsert into the `users` collection: creates the admin if it
// doesn't exist (e.g. right after a fresh/cleaned database), or resyncs the
// password + role if it does. No separate find-then-insert/update round trip,
// so this can't race or silently no-op against an empty collection.
async function seedDefaultAdmin() {
  const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com";
  const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "ChangeMe123!";

  if (!defaultAdminEmail || !defaultAdminPassword) {
    console.log(
      "ℹ️  DEFAULT_ADMIN_EMAIL/DEFAULT_ADMIN_PASSWORD not set — skipping admin seeding.",
    );
    return;
  }

  const normalizedEmail = defaultAdminEmail.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(defaultAdminPassword, 10);

  const result = await usersCollection.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: { passwordHash, role: "admin", email: normalizedEmail },
      $setOnInsert: { name: "System Admin", createdAt: new Date() },
    },
    { upsert: true, returnDocument: "after" },
  );

  const wasInserted = !!result.lastErrorObject?.upserted;
  console.log(
    wasInserted
      ? `✅ Default admin account seeded into 'users' collection: ${normalizedEmail}`
      : `✅ Admin credentials synchronized in 'users' collection: ${normalizedEmail}`,
  );
}

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  usersCollection = db.collection("users");
  projectsCollection = db.collection("projects");
  projectMembersCollection = db.collection("project_members");
  labsCollection = db.collection("labs");
  articlesCollection = db.collection("articles");
  tagsCollection = db.collection("tags");
  formSubmissionsCollection = db.collection("form_submissions");
  announcementsCollection = db.collection("announcements");
  projectViewsCollection = db.collection("project_views");

  await usersCollection.createIndex({ email: 1 }, { unique: true });
  await labsCollection.createIndex({ name: 1 }, { unique: true });
  await articlesCollection.createIndex(
    { slug: 1 },
    { unique: true, sparse: true },
  );
  await articlesCollection.createIndex({
    title: "text",
    description: "text",
    content: "text",
    category: "text",
  });
  await projectsCollection.createIndex(
    { slug: 1 },
    { unique: true, sparse: true },
  );
  await projectsCollection.createIndex({
    title: "text",
    description: "text",
    tags: "text",
  });
  await projectsCollection.createIndex({ status: 1, createdAt: -1 });
  await projectsCollection.createIndex({
    featured: 1,
    status: 1,
    createdAt: -1,
  });
  await projectMembersCollection.createIndex({ projectId: 1 });
  await projectMembersCollection.createIndex({ userId: 1 });
  await projectViewsCollection.createIndex({ projectId: 1 });
  await projectViewsCollection.createIndex(
    { projectId: 1, ipAddress: 1, deviceFingerprint: 1 },
    { unique: true },
  );
  await projectViewsCollection.createIndex(
    { viewedAt: 1 },
    { expireAfterSeconds: 7776000 },
  );
  await tagsCollection.createIndex({ name: 1 }, { unique: true });
  await formSubmissionsCollection.createIndex({ createdAt: -1 });
  await formSubmissionsCollection.createIndex({ email: 1 }, { unique: true });
  await formSubmissionsCollection.createIndex({ id: 1 }, { unique: true });
  await announcementsCollection.createIndex({ createdAt: -1 });

  await seedDefaultAdmin();

  console.log(`✅ Connected to MongoDB ${DB_NAME}`);
}

function createToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, email: user.email },
    JWT_SECRET,
    {
      expiresIn: "8h",
    },
  );
}

async function generateUniqueSlug(collection, baseSlug, excludeId = null) {
  if (!baseSlug) {
    baseSlug = `article-${Date.now()}`;
  }

  let slug = baseSlug;
  let suffix = 1;
  let query = { slug };
  if (excludeId) {
    query = { slug, _id: { $ne: new ObjectId(excludeId) } };
  }

  while (await collection.findOne(query)) {
    slug = `${baseSlug}-${suffix++}`;
    query.slug = slug;
  }

  return slug;
}

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587", 10);
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  (EMAIL_USER
    ? `"MIT Research Lab" <${EMAIL_USER}>`
    : '"MIT Research Lab" <noreply@research.lab>');
const APP_URL = process.env.APP_URL || "http://localhost:5173";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://mit-2-frontend.vercel.app";

console.log("\n📧 Email Configuration:");
console.log(`   APP_URL: ${APP_URL}`);
console.log(`   FRONTEND_URL: ${FRONTEND_URL}`);
console.log(`   EMAIL_USER: ${EMAIL_USER ? "✅ " + EMAIL_USER : "❌ NOT SET"}`);
console.log(
  `   EMAIL_PASS: ${EMAIL_PASS ? "✅ Set (" + EMAIL_PASS.length + " chars)" : "❌ NOT SET"}`,
);
console.log(`   EMAIL_FROM: ${EMAIL_FROM}\n`);

const mailTransporter =
  EMAIL_USER && EMAIL_PASS
    ? nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: EMAIL_PORT === 465 || process.env.EMAIL_SECURE === "true",
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      })
    : null;

if (mailTransporter) {
  mailTransporter.verify((error) => {
    if (error) {
      console.error(
        '❌ Email Auth Error (535): The App Password "EMAIL_PASS" is invalid.',
      );
    } else {
      console.log("✅ Email service is authenticated and ready.");
    }
  });
} else {
  console.log("⚠️  Email service not configured.");
}

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;
const ADMIN_PHONE_NUMBER = process.env.ADMIN_PHONE_NUMBER;

let twilioClient = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  console.log("✅ SMS service (Twilio) is configured and ready.");
} else {
  console.log("⚠️  SMS service not configured.");
}

async function sendSMS(to, body) {
  if (!twilioClient || !TWILIO_FROM_NUMBER) {
    console.warn("⚠️  SMS not configured; skipping SMS to:", to);
    return;
  }
  if (!to) {
    console.warn("⚠️  SMS skipped: no destination phone number provided.");
    return;
  }
  try {
    const msg = await twilioClient.messages.create({
      from: TWILIO_FROM_NUMBER,
      to,
      body,
    });
    console.log(`✅ SMS sent to ${to} — SID: ${msg.sid}`);
  } catch (err) {
    console.error("❌ Failed to send SMS:", err.message);
  }
}

async function sendMail({ to, subject, html, text }) {
  if (!mailTransporter || !EMAIL_USER || !EMAIL_PASS) {
    console.warn(
      "⚠️  Email credentials not configured; skipping email to:",
      to,
    );
    return;
  }
  try {
    await mailTransporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    console.log(`✅ Email successfully sent to: ${to}`);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

function createConfirmationToken() {
  return crypto.randomBytes(24).toString("hex");
}

function isAuthorizedEditor(user) {
  return user && (user.role === "admin" || user.role === "researcher");
}

function validateUserRole(role) {
  return USER_ROLES.includes(role);
}
function validateProjectStatus(status) {
  return PROJECT_STATUSES.includes(status);
}

function parseAuthToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

async function parseAuthUser(req) {
  const payload = parseAuthToken(req);
  if (!payload) return null;
  try {
    const user = await usersCollection.findOne({
      _id: new ObjectId(payload.id),
    });
    return sanitizeUser(user);
  } catch {
    return null;
  }
}

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await usersCollection.findOne({
      _id: new ObjectId(payload.id),
    });
    if (!user) return res.status(401).json({ error: "Invalid token" });
    req.user = sanitizeUser(user);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

async function requireProjectMember(req, res, next) {
  const user = req.user;
  const projectId = req.params.id;
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (!ObjectId.isValid(projectId)) {
    return res.status(400).json({ error: "Invalid project id" });
  }

  const membership = await projectMembersCollection.findOne({
    projectId: new ObjectId(projectId),
    userId: new ObjectId(user._id),
  });

  if (!membership && user.role !== "admin") {
    return res.status(403).json({ error: "Only project team members can modify this project" });
  }
  next();
}

// ---- Auth ----
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await usersCollection.findOne({
      email: normalizedEmail,
    });
    if (existingUser)
      return res.status(400).json({ error: "Email already in use" });

    const totalUsers = await usersCollection.countDocuments();
    const role = totalUsers <= 1 ? "admin" : "student";
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await usersCollection.insertOne({
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      createdAt: new Date(),
    });
    const user = await usersCollection.findOne({ _id: result.insertedId });
    const token = createToken(user);
    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const normalizedEmail = email.toLowerCase().trim();
    const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL?.toLowerCase().trim();
    const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
    const isDefaultAdminLogin =
      normalizedEmail === defaultAdminEmail && password === defaultAdminPassword;

    let user = await usersCollection.findOne({ email: normalizedEmail });

    if (!user && isDefaultAdminLogin) {
      const passwordHash = await bcrypt.hash(defaultAdminPassword, 10);
      const result = await usersCollection.insertOne({
        name: "System Admin",
        email: normalizedEmail,
        passwordHash,
        role: "admin",
        createdAt: new Date(),
      });
      user = await usersCollection.findOne({ _id: result.insertedId });
    }

    if (user && isDefaultAdminLogin) {
      const passwordHash = await bcrypt.hash(defaultAdminPassword, 10);
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { passwordHash, role: "admin", email: normalizedEmail } },
      );
      user = await usersCollection.findOne({ _id: user._id });
    }

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createToken(user);
    res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/auth/me", authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// ---- Users ----
app.get("/api/users", authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await usersCollection
      .find({}, { projection: { passwordHash: 0 } })
      .toArray();
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/users/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.passwordHash;
    if (updates.email) updates.email = updates.email.toLowerCase().trim();
    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }
    if (updates.role && !validateUserRole(updates.role)) {
      return res.status(400).json({ error: "Invalid user role" });
    }
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after", projection: { passwordHash: 0 } },
    );
    if (!result.value) return res.status(404).json({ error: "User not found" });
    res.json({ user: result.value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// ✅ NEW: Fast project list — NO $lookup joins, returns in <100ms
// Used by Home and Research pages. Must be defined BEFORE /api/projects/:id
// ================================================================
app.get("/api/projects/fast", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Always public-only on this route — no admin bypass needed
    const filter = { status: "published" };
    if (req.query.featured === "true") filter.featured = true;
    if (req.query.tag) filter.tags = req.query.tag;

    const cacheKey = `projects:fast:${JSON.stringify(filter)}:${page}:${limit}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      res.setHeader("Cache-Control", "public, max-age=300");
      res.setHeader("X-Cache", "HIT");
      return res.json(cached);
    }

    // Use aggregation to compute hasImage in MongoDB — never transfers base64 to Node.js
    const [projects, total] = await Promise.all([
      projectsCollection
        .aggregate([
          { $match: filter },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $addFields: {
              hasImage: {
                $gt: [
                  {
                    $strLenCP: {
                      $ifNull: [
                        { $ifNull: ["$coverImage", "$cover_image"] },
                        "",
                      ],
                    },
                  },
                  100,
                ],
              },
            },
          },
          {
            $project: {
              title: 1,
              slug: 1,
              tags: 1,
              status: 1,
              description: {
                $substrCP: [{ $ifNull: ["$description", ""] }, 0, 150],
              },
              featured: 1,
              createdAt: 1,
              teamCount: 1,
              hasImage: 1,
            },
          },
        ])
        .toArray(),
      projectsCollection.countDocuments(filter),
    ]);

    // Build coverImage as a full URL for the frontend — no base64 involved
    const trimmed = projects.map((p) => {
      const imgUrl = p.hasImage
        ? `${API_BASE_URL}/api/projects/${p._id}/image`
        : null;
      return {
        ...p,
        coverImage: imgUrl,
        cover_image: imgUrl,
        coverImageUrl: imgUrl,
      };
    });

    const result = {
      projects: trimmed,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
    cacheSet(cacheKey, result);
    res.setHeader("Cache-Control", "public, max-age=300");
    res.setHeader("X-Cache", "MISS");
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Projects (full list with team counts — used by admin) ----
app.get("/api/projects", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const { q, lab, tag, year, status, featured } = req.query;
    const filter = {};

    if (lab && ObjectId.isValid(lab)) filter.labId = new ObjectId(lab);
    if (tag) filter.tags = tag;
    if (featured === "true") filter.featured = true;

    const tokenPayload = parseAuthToken(req);
    const isAdmin = tokenPayload?.role === "admin";

    if (status && validateProjectStatus(status)) {
      if (status !== "published" && !isAdmin) {
        return res
          .status(403)
          .json({
            error: "Admin access is required to query non-published projects",
          });
      }
      filter.status = status;
    } else if (!isAdmin) {
      filter.status = "published";
    }
    if (year) {
      const yearInt = parseInt(year, 10);
      if (!Number.isNaN(yearInt)) {
        filter.createdAt = {
          $gte: new Date(`${yearInt}-01-01T00:00:00.000Z`),
          $lt: new Date(`${yearInt + 1}-01-01T00:00:00.000Z`),
        };
      }
    }
    if (q) filter.$text = { $search: q };

    const cacheKey =
      !isAdmin && !q
        ? `projects:list:${JSON.stringify(filter)}:${page}:${limit}`
        : null;
    if (cacheKey) {
      const cached = cacheGet(cacheKey);
      if (cached) {
        res.setHeader("Cache-Control", "public, max-age=300");
        res.setHeader("X-Cache", "HIT");
        return res.json(cached);
      }
    }

    const pipeline = [
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit + 1 },
      {
        $lookup: {
          from: "project_members",
          localField: "_id",
          foreignField: "projectId",
          as: "_members",
          pipeline: [{ $project: { _id: 1 } }],
        },
      },
      {
        $project: {
          title: 1,
          slug: 1,
          tags: 1,
          status: 1,
          description: { $substr: ["$description", 0, 150] },
          _id: 1,
          teamCount: { $size: "$_members" },
          hasImage: {
            $cond: [
              {
                $and: [
                  { $ifNull: ["$coverImage", false] },
                  {
                    $gt: [{ $strLenCP: { $ifNull: ["$coverImage", ""] } }, 100],
                  },
                ],
              },
              true,
              false,
            ],
          },
        },
      },
    ];

    const [projects, total] = await Promise.all([
      projectsCollection.aggregate(pipeline).toArray(),
      projectsCollection.countDocuments(filter),
    ]);

    const hasMore = projects.length > limit;
    const projectList = hasMore ? projects.slice(0, limit) : projects;
    const result = {
      projects: projectList,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    if (cacheKey) {
      cacheSet(cacheKey, result);
      res.setHeader("Cache-Control", "public, max-age=300");
      res.setHeader("X-Cache", "MISS");
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/team-members", async (req, res) => {
  try {
    const members = await projectMembersCollection
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$user._id",
            name: { $first: "$user.name" },
            email: { $first: "$user.email" },
            roles: { $addToSet: "$role" },
            projectCount: { $sum: 1 },
          },
        },
        { $sort: { projectCount: -1, name: 1 } },
      ])
      .toArray();
    res.json({ members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/announcements", async (req, res) => {
  try {
    const announcements = await announcementsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ announcements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/announcements", async (req, res) => {
  try {
    const { title, content, authorName, authorEmail } = req.body;
    if (!title || !content || !authorName || !authorEmail) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const announcement = {
      title: title.trim(),
      content: content.trim(),
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim(),
      createdAt: new Date(),
    };
    const result = await announcementsCollection.insertOne(announcement);
    res
      .status(201)
      .json({ announcement: { _id: result.insertedId, ...announcement } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const project = await fetchProjectWithTeam(id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/projects/:id/image", async (req, res) => {
  try {
    const { id } = req.params;
    const match = ObjectId.isValid(id)
      ? { _id: new ObjectId(id) }
      : { slug: id };
    const project = await projectsCollection.findOne(match, {
      projection: { coverImage: 1, cover_image: 1, _id: 0 },
    });
    const raw = project?.coverImage || project?.cover_image || "";
    if (!raw || raw.length < 50) return res.status(404).send("No image");

    const dataUriMatch = raw.match(
      /^data:([a-zA-Z0-9+\/]+\/[a-zA-Z0-9+\/]+);base64,(.+)$/,
    );
    if (dataUriMatch) {
      const mime = dataUriMatch[1];
      const buf = Buffer.from(dataUriMatch[2], "base64");
      res.setHeader("Content-Type", mime);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Content-Length", buf.length);
      return res.end(buf);
    }
    if (
      raw.startsWith("http://") ||
      raw.startsWith("https://") ||
      raw.startsWith("/")
    ) {
      return res.redirect(302, raw);
    }
    const buf = Buffer.from(raw, "base64");
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Length", buf.length);
    return res.end(buf);
  } catch (err) {
    res.status(500).send("Image error");
  }
});

async function fetchProjectWithTeam(idOrSlug) {
  const match = ObjectId.isValid(idOrSlug)
    ? { _id: new ObjectId(idOrSlug) }
    : { slug: idOrSlug };

  const results = await projectsCollection
    .aggregate([
      { $match: match },
      {
        $lookup: {
          from: "project_members",
          localField: "_id",
          foreignField: "projectId",
          as: "members",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "members.userId",
          foreignField: "_id",
          as: "userRecords",
        },
      },
      {
        $addFields: {
          team: {
            $map: {
              input: "$members",
              as: "member",
              in: {
                role: "$$member.role",
                joinedAt: "$$member.createdAt",
                user: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$userRecords",
                        cond: { $eq: ["$$this._id", "$$member.userId"] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },
      { $project: { members: 0, userRecords: 0, "team.user.passwordHash": 0 } },
    ])
    .toArray();

  const project = results[0] || null;
  if (project && project.team) {
    console.log(
      `✅ Project "${project.title}" has ${project.team.length} team members`,
    );
  } else if (project) {
    console.log(`⚠️  Project "${project.title}" has NO team members set`);
  }
  return project;
}

app.post("/api/projects", async (req, res) => {
  try {
    let userId;
    const authUser = await parseAuthUser(req);

    if (authUser) {
      userId = new ObjectId(authUser._id);
    } else {
      const { lead, email } = req.body;
      if (!email)
        return res
          .status(400)
          .json({ error: "Email is required for unauthenticated submissions" });
      const normalizedEmail = email.toLowerCase().trim();
      let user = await usersCollection.findOne({ email: normalizedEmail });
      if (!user) {
        const result = await usersCollection.insertOne({
          name: lead || "Anonymous Researcher",
          email: normalizedEmail,
          role: "researcher",
          createdAt: new Date(),
        });
        userId = result.insertedId;
      } else {
        userId = user._id;
      }
    }

    const title = req.body.title?.trim();
    if (!title)
      return res.status(400).json({ error: "Project title is required" });

    const status = validateProjectStatus(req.body.status)
      ? req.body.status
      : "draft";
    const tags = Array.isArray(req.body.tags) ? req.body.tags : [];
    const featured = req.body.featured === true;
    const coverImage = req.body.coverImage || req.body.cover_image || "";
    const description = req.body.description || "";

    const slugBase = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = await generateUniqueSlug(projectsCollection, slugBase);

    const project = {
      title,
      description,
      coverImage,
      videoUrl: req.body.videoUrl || req.body.video_url || "",
      status,
      tags,
      labId:
        req.body.labId && ObjectId.isValid(req.body.labId)
          ? new ObjectId(req.body.labId)
          : null,
      createdBy: userId,
      lead: req.body.lead || "",
      leadEmail: req.body.email ? req.body.email.toLowerCase().trim() : "",
      createdAt: new Date(),
      updatedAt: new Date(),
      featured,
      slug,
    };

    const result = await projectsCollection.insertOne(project);
    const created = await projectsCollection.findOne({
      _id: result.insertedId,
    });

    const teamMembersInput = Array.isArray(req.body.teamMembers)
      ? req.body.teamMembers
      : [];
    const projectMemberDocs = [];

    for (const member of teamMembersInput) {
      let memberId;
      if (typeof member === "string" && ObjectId.isValid(member)) {
        memberId = new ObjectId(member);
      } else if (member.userId && ObjectId.isValid(member.userId)) {
        memberId = new ObjectId(member.userId);
      } else if (member.name) {
        const trimmedName = member.name.trim();
        let user = await usersCollection.findOne({ name: trimmedName });
        if (!user) {
          const r = await usersCollection.insertOne({
            name: trimmedName,
            email: `${trimmedName.toLowerCase().replace(/\s+/g, ".")}@mit.edu`,
            role: "researcher",
            createdAt: new Date(),
          });
          memberId = r.insertedId;
        } else {
          memberId = user._id;
        }
      }
      if (memberId) {
        projectMemberDocs.push({
          projectId: result.insertedId,
          userId: memberId,
          role: member.role || "Researcher",
          createdAt: new Date(),
        });
      }
    }

    if (projectMemberDocs.length > 0) {
      await projectMembersCollection.insertMany(projectMemberDocs);
      console.log(
        `✅ Added ${projectMemberDocs.length} team members to project`,
      );
    }

    if (project.leadEmail) {
      const leadUser = await usersCollection.findOne({
        email: project.leadEmail.toLowerCase(),
      });
      if (leadUser) {
        const leadExists = await projectMembersCollection.findOne({
          projectId: result.insertedId,
          userId: leadUser._id,
        });
        if (!leadExists) {
          await projectMembersCollection.insertOne({
            projectId: result.insertedId,
            userId: leadUser._id,
            role: "Lead Researcher",
            createdAt: new Date(),
          });
        }
      }
    }

    // Always make sure whoever created the project shows up on the People page,
    // even when no explicit lead/team members were provided.
    const creatorAlreadyMember = await projectMembersCollection.findOne({
      projectId: result.insertedId,
      userId,
    });
    if (!creatorAlreadyMember) {
      await projectMembersCollection.insertOne({
        projectId: result.insertedId,
        userId,
        role: "Lead Researcher",
        createdAt: new Date(),
      });
    }

    // Invalidate fast cache on new project
    cacheInvalidate("projects:fast:");
    cacheInvalidate("projects:list:");

    const full = await fetchProjectWithTeam(created._id.toString());
    res.status(201).json({ project: full });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.patch(
  "/api/projects/:id/status",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!ObjectId.isValid(id))
        return res.status(400).json({ error: "Invalid project id" });
      if (!validateProjectStatus(status))
        return res.status(400).json({ error: "Invalid project status" });

      const result = await projectsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: "after" },
      );
      if (!result.value)
        return res.status(404).json({ error: "Project not found" });
      cacheInvalidate("projects:fast:");
      cacheInvalidate("projects:list:");
      res.json({ project: result.value });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

app.put("/api/projects/:id", authenticate, requireProjectMember, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid project id" });

    const updates = { updatedAt: new Date() };
    if (req.body.title) updates.title = req.body.title.trim();
    if (req.body.description) updates.description = req.body.description;
    if (req.body.coverImage || req.body.cover_image)
      updates.coverImage = req.body.coverImage || req.body.cover_image;
    if (req.body.videoUrl || req.body.video_url)
      updates.videoUrl = req.body.videoUrl || req.body.video_url;
    if (req.body.tags)
      updates.tags = Array.isArray(req.body.tags) ? req.body.tags : [];
    if (req.body.featured !== undefined)
      updates.featured = req.body.featured === true;
    if (req.body.status && validateProjectStatus(req.body.status))
      updates.status = req.body.status;
    if (req.body.labId && ObjectId.isValid(req.body.labId))
      updates.labId = new ObjectId(req.body.labId);
    if (req.body.leadEmail)
      updates.leadEmail = req.body.leadEmail.toLowerCase().trim();

    const result = await projectsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" },
    );
    if (!result.value)
      return res.status(404).json({ error: "Project not found" });

    if (Array.isArray(req.body.teamMembers)) {
      await projectMembersCollection.deleteMany({
        projectId: new ObjectId(id),
      });
      const newMemberDocs = [];
      for (const member of req.body.teamMembers) {
        let memberId;
        if (typeof member === "string" && ObjectId.isValid(member)) {
          memberId = new ObjectId(member);
        } else if (member.userId && ObjectId.isValid(member.userId)) {
          memberId = new ObjectId(member.userId);
        } else if (member.name) {
          const trimmedName = member.name.trim();
          let user = await usersCollection.findOne({ name: trimmedName });
          if (!user) {
            const r = await usersCollection.insertOne({
              name: trimmedName,
              email: `${trimmedName.toLowerCase().replace(/\s+/g, ".")}@mit.edu`,
              role: "researcher",
              createdAt: new Date(),
            });
            memberId = r.insertedId;
          } else {
            memberId = user._id;
          }
        }
        if (memberId) {
          newMemberDocs.push({
            projectId: new ObjectId(id),
            userId: memberId,
            role: member.role || "Researcher",
            createdAt: new Date(),
          });
        }
      }
      if (newMemberDocs.length > 0) {
        await projectMembersCollection.insertMany(newMemberDocs);
        console.log(
          `✅ Updated ${newMemberDocs.length} team members for project`,
        );
      }
    }

    const updatedProject = result.value;
    if (updatedProject.leadEmail) {
      const leadUser = await usersCollection.findOne({
        email: updatedProject.leadEmail.toLowerCase(),
      });
      if (leadUser) {
        const leadExists = await projectMembersCollection.findOne({
          projectId: new ObjectId(id),
          userId: leadUser._id,
        });
        if (!leadExists) {
          await projectMembersCollection.insertOne({
            projectId: new ObjectId(id),
            userId: leadUser._id,
            role: "Lead Researcher",
            createdAt: new Date(),
          });
        }
      }
    }

    // Invalidate fast cache on update
    cacheInvalidate("projects:fast:");
    cacheInvalidate("projects:list:");

    const project = await fetchProjectWithTeam(id);
    res.json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete(
  "/api/projects/:id",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id))
        return res.status(400).json({ error: "Invalid project id" });
      const result = await projectsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount === 0)
        return res.status(404).json({ error: "Project not found" });
      cacheInvalidate("projects:fast:");
      cacheInvalidate("projects:list:");
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

// ---- Project Views Tracking ----
app.post("/api/projects/:id/view", async (req, res) => {
  try {
    const { id } = req.params;
    const { deviceFingerprint } = req.body;

    // Validate project exists
    const projectMatch = ObjectId.isValid(id)
      ? { _id: new ObjectId(id) }
      : { slug: id };
    const projectExists = await projectsCollection.findOne(projectMatch);
    if (!projectExists)
      return res.status(404).json({ error: "Project not found" });

    const projectId = projectExists._id.toString();

    // Get IP address (handle proxies)
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket.remoteAddress ||
      req.connection.remoteAddress ||
      "unknown";

    // Create unique view identifier
    const fingerprint =
      deviceFingerprint || req.headers["user-agent"] || "unknown";

    try {
      // Try to update or insert - one view per IP+device combination
      const result = await projectViewsCollection.updateOne(
        {
          projectId: new ObjectId(projectId),
          ipAddress,
          deviceFingerprint: fingerprint,
        },
        {
          $set: {
            projectId: new ObjectId(projectId),
            ipAddress,
            deviceFingerprint: fingerprint,
            viewedAt: new Date(),
          },
        },
        { upsert: true },
      );

      // Get total view count
      const viewCount = await projectViewsCollection.countDocuments({
        projectId: new ObjectId(projectId),
      });

      res.json({
        success: true,
        viewCount,
        isNewView: result.upsertedId ? true : false,
      });
    } catch (dbErr) {
      // Handle unique constraint error gracefully (means view already exists)
      if (dbErr.code === 11000) {
        const viewCount = await projectViewsCollection.countDocuments({
          projectId: new ObjectId(projectId),
        });
        return res.json({ success: true, viewCount, isNewView: false });
      }
      throw dbErr;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/projects/:id/views", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate project exists
    const projectMatch = ObjectId.isValid(id)
      ? { _id: new ObjectId(id) }
      : { slug: id };
    const projectExists = await projectsCollection.findOne(projectMatch);
    if (!projectExists)
      return res.status(404).json({ error: "Project not found" });

    const projectId = projectExists._id.toString();
    const viewCount = await projectViewsCollection.countDocuments({
      projectId: new ObjectId(projectId),
    });

    res.json({ viewCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Labs ----
app.get("/api/labs", async (req, res) => {
  try {
    const labs = await labsCollection.find({}).sort({ name: 1 }).toArray();
    res.json({ labs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/labs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid lab id" });
    const lab = await labsCollection.findOne({ _id: new ObjectId(id) });
    if (!lab) return res.status(404).json({ error: "Lab not found" });
    res.json({ lab });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/labs", authenticate, requireAdmin, async (req, res) => {
  try {
    const lab = {
      name: req.body.name,
      description: req.body.description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await labsCollection.insertOne(lab);
    const created = await labsCollection.findOne({ _id: result.insertedId });
    res.status(201).json({ lab: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/labs/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid lab id" });
    const updates = { ...req.body, updatedAt: new Date() };
    const result = await labsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" },
    );
    if (!result.value) return res.status(404).json({ error: "Lab not found" });
    res.json({ lab: result.value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/labs/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid lab id" });
    const result = await labsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Lab not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Tags ----
app.get("/api/tags", async (req, res) => {
  try {
    const tags = await tagsCollection.find({}).sort({ name: 1 }).toArray();
    res.json({ tags });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tags", authenticate, requireAdmin, async (req, res) => {
  try {
    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ error: "Tag name is required" });
    const existing = await tagsCollection.findOne({ name });
    if (existing) return res.status(400).json({ error: "Tag already exists" });
    const result = await tagsCollection.insertOne({
      name,
      createdAt: new Date(),
    });
    res
      .status(201)
      .json({ tag: await tagsCollection.findOne({ _id: result.insertedId }) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Articles ----
app.get("/api/articles", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.q) filter.$text = { $search: req.query.q };

    const total = await articlesCollection.countDocuments(filter);
    const articles = await articlesCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .project({ content: 0 })
      .skip(skip)
      .limit(limit)
      .toArray();
    res.json({ articles, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/articles/latest", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const categories = [
      "Research",
      "Science",
      "Media Lab",
      "AI",
      "Robotics",
      "Health",
      "Technology",
    ];
    const articles = await articlesCollection
      .find({
        image: { $ne: "", $exists: true, $type: "string", $regex: ".+" },
        category: { $in: categories },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    res.json({ articles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/articles/:slug", async (req, res) => {
  try {
    const article = await articlesCollection.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json({ article });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/articles/:slug/related", async (req, res) => {
  try {
    const article = await articlesCollection.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ error: "Article not found" });
    const related = await articlesCollection
      .find({
        slug: { $ne: article.slug },
        image: { $ne: "", $exists: true, $type: "string", $regex: ".+" },
        $or: [
          { category: article.category },
          {
            title: {
              $regex: article.title.split(" ").slice(0, 3).join("|"),
              $options: "i",
            },
          },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(4)
      .toArray();
    res.json({ articles: related });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/articles", authenticate, requireAdmin, async (req, res) => {
  try {
    const rawSlug =
      req.body.slug ||
      req.body.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const slug = await generateUniqueSlug(articlesCollection, rawSlug);
    const article = {
      title: req.body.title,
      slug,
      description: req.body.description || "",
      content: req.body.content || [],
      image: req.body.image || "",
      category: req.body.category || "Research",
      publishDate: req.body.publishDate
        ? new Date(req.body.publishDate)
        : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await articlesCollection.insertOne(article);
    res
      .status(201)
      .json({
        article: await articlesCollection.findOne({ _id: result.insertedId }),
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/articles/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid article id" });
    const updates = { ...req.body, updatedAt: new Date() };
    if (updates.slug)
      updates.slug = await generateUniqueSlug(
        articlesCollection,
        updates.slug,
        id,
      );
    const result = await articlesCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" },
    );
    if (!result.value)
      return res.status(404).json({ error: "Article not found" });
    res.json({ article: result.value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete(
  "/api/articles/:id",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id))
        return res.status(400).json({ error: "Invalid article id" });
      const result = await articlesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount === 0)
        return res.status(404).json({ error: "Article not found" });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

// ---- Search ----
app.get("/api/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ results: [], query: "" });
    const [articleResults, projectResults] = await Promise.all([
      articlesCollection
        .find({ $text: { $search: q } })
        .sort({ score: { $meta: "textScore" } })
        .limit(30)
        .toArray(),
      projectsCollection
        .find({ $text: { $search: q } })
        .sort({ score: { $meta: "textScore" } })
        .limit(30)
        .toArray(),
    ]);
    const results = [
      ...articleResults.map((a) => ({ ...a, resultType: "article" })),
      ...projectResults.map((p) => ({ ...p, resultType: "project" })),
    ];
    res.json({
      query: q,
      articles: articleResults,
      projects: projectResults,
      results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Scrape ----
app.post("/api/scrape", async (req, res) => {
  try {
    res.json({ status: "scraping started" });
    scrapeAll()
      .then((r) => console.log("Scrape complete:", r))
      .catch((e) => console.error("Scrape error:", e));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const [totalArticles, totalProjects, categories, lastArticle] =
      await Promise.all([
        articlesCollection.countDocuments(),
        projectsCollection.countDocuments(),
        articlesCollection.distinct("category"),
        articlesCollection.find({}).sort({ createdAt: -1 }).limit(1).toArray(),
      ]);
    res.json({
      totalArticles,
      totalProjects,
      categories,
      lastScraped: lastArticle[0]?.createdAt || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", db: "connected" });
});

app.get("/api/healthz", (req, res) => {
  res.json({ status: "ok" });
});

// ---- Fix missing team members ----
// Finds every project with zero linked project_members (checked against the
// real project_members collection, not an unused embedded "team" field) and
// backfills it from the project's lead email or, failing that, its creator.
async function backfillMissingTeamMembers() {
  const projectsWithCounts = await projectsCollection
    .aggregate([
      {
        $lookup: {
          from: "project_members",
          localField: "_id",
          foreignField: "projectId",
          as: "members",
        },
      },
      {
        $project: {
          leadEmail: 1,
          createdBy: 1,
          memberCount: { $size: "$members" },
        },
      },
      { $match: { memberCount: 0 } },
    ])
    .toArray();

  let updated = 0;
  for (const project of projectsWithCounts) {
    let memberUserId = null;
    if (project.leadEmail) {
      const lead = await usersCollection.findOne({
        email: project.leadEmail.toLowerCase(),
      });
      if (lead) memberUserId = lead._id;
    }
    if (!memberUserId && project.createdBy) {
      const creator = await usersCollection.findOne({ _id: project.createdBy });
      if (creator) memberUserId = creator._id;
    }
    if (memberUserId) {
      await projectMembersCollection.insertOne({
        projectId: project._id,
        userId: memberUserId,
        role: "Lead Researcher",
        createdAt: new Date(),
      });
      updated++;
    }
  }
  return updated;
}

app.post(
  "/api/fix-missing-team-members",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const updated = await backfillMissingTeamMembers();
      res.json({
        success: true,
        message: `Updated ${updated} projects with team members`,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

// ---- Form Submissions ----
app.post("/api/form-submissions", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      id,
      qualifications,
      experience,
      motivation,
      university,
      program,
      otherInfo,
      projectId,
    } = req.body;
    if (!name || !email || !phone || !id)
      return res
        .status(400)
        .json({ error: "Name, email, phone, and ID are required" });

    const existingSubmission = await formSubmissionsCollection.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { id: id.trim() }],
    });
    if (existingSubmission)
      return res
        .status(400)
        .json({
          error:
            "An application with this email or ID/Passport already exists.",
        });

    let projectTitle = "";
    let projectLeadEmail = "";
    let projectSlug = "";
    if (projectId && ObjectId.isValid(projectId)) {
      const project = await projectsCollection.findOne({
        _id: new ObjectId(projectId),
      });
      if (project) {
        projectTitle = project.title || "";
        projectLeadEmail = project.leadEmail || "";
        projectSlug = project.slug || "";
      }
    }

    const submission = {
      name,
      email: email.toLowerCase().trim(),
      phone,
      id,
      qualifications: qualifications || "",
      experience: experience || "",
      motivation: motivation || "",
      university: university || "",
      program: program || "",
      otherInfo: otherInfo || "",
      projectId:
        projectId && ObjectId.isValid(projectId)
          ? new ObjectId(projectId)
          : null,
      projectTitle,
      projectSlug,
      projectLeadEmail: projectLeadEmail.toLowerCase().trim(),
      leadRequestStatus: "not-requested",
      leadConfirmationToken: null,
      leadResponseAt: null,
      assignedAt: null,
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await formSubmissionsCollection.insertOne(submission);

    if (ADMIN_PHONE_NUMBER) {
      const smsBody = `📋 New EIAS Application!\nName: ${submission.name}\nPhone: ${submission.phone}\nProject: ${submission.projectTitle || "Not specified"}\nEmail: ${submission.email}`;
      sendSMS(ADMIN_PHONE_NUMBER, smsBody).catch(() => {});
    }

    res
      .status(201)
      .json({
        success: true,
        message: "Form submitted successfully",
        id: result.insertedId,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get(
  "/api/form-submissions",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const status = req.query.status || "all";
      const searchQuery = req.query.search || "";
      const filter = {};
      if (status !== "all") filter.status = status;
      if (searchQuery) {
        filter.$or = [
          { name: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
          { phone: { $regex: searchQuery, $options: "i" } },
          { id: { $regex: searchQuery, $options: "i" } },
        ];
      }
      const total = await formSubmissionsCollection.countDocuments(filter);
      const submissions = await formSubmissionsCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
      res.json({
        submissions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

app.get(
  "/api/form-submissions-stats",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const total = await formSubmissionsCollection.countDocuments();
      const statusStats = await formSubmissionsCollection
        .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
        .toArray();
      const byStatus = {};
      statusStats.forEach((item) => {
        byStatus[item._id || "new"] = item.count;
      });
      res.json({ total, byStatus });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

app.get(
  "/api/form-submissions/:id",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id))
        return res.status(400).json({ error: "Invalid submission ID" });
      const submission = await formSubmissionsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      if (!submission)
        return res.status(404).json({ error: "Submission not found" });
      res.json({ submission });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

app.put(
  "/api/form-submissions/:id",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id))
        return res.status(400).json({ error: "Invalid submission ID" });
      const { status, notes } = req.body;
      const validStatuses = [
        "new",
        "reviewing",
        "contacted",
        "rejected",
        "accepted",
      ];
      if (status && !validStatuses.includes(status))
        return res.status(400).json({ error: "Invalid status" });

      const existing = await formSubmissionsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      if (!existing)
        return res.status(404).json({ error: "Submission not found" });

      const updates = {};
      if (status) updates.status = status;
      if (notes !== undefined) updates.notes = notes;
      updates.updatedAt = new Date();

      let leadConfirmationToken = existing.leadConfirmationToken;
      if (status === "accepted" && existing.status !== "accepted") {
        if (existing.projectLeadEmail) {
          leadConfirmationToken = createConfirmationToken();
          updates.leadRequestStatus = "pending";
          updates.leadConfirmationToken = leadConfirmationToken;
        } else {
          updates.leadRequestStatus = "not-required";
        }
      }

      const result = await formSubmissionsCollection.findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: updates },
        { returnDocument: "after" },
      );

      const submission = result.value !== undefined ? result.value : result;
      if (!submission)
        return res.status(404).json({ error: "Submission not found" });

      if (status === "accepted" && existing.status !== "accepted") {
        console.log(
          `📧 Processing acceptance emails for student: ${submission.email}`,
        );
        let studentProjectSlug = submission.projectSlug || "";
        let studentProjectPageLink = `${FRONTEND_URL}/projects`;
        if (!studentProjectSlug && submission.projectId) {
          const project = await projectsCollection.findOne(
            { _id: new ObjectId(submission.projectId) },
            { projection: { slug: 1 } },
          );
          studentProjectSlug = project?.slug || "";
        }
        if (studentProjectSlug) {
          studentProjectPageLink = `${FRONTEND_URL}/projects/${studentProjectSlug}`;
        } else if (submission.projectId) {
          studentProjectPageLink = `${FRONTEND_URL}/projects/${submission.projectId}`;
        }
        const studentSubject = "Your EIAS program request has been accepted";
        const studentText = `Hello ${submission.name},\n\nYour application to join the EIAS program ${submission.projectTitle ? `for the research project "${submission.projectTitle}" ` : ""}has been accepted by the admin team.\n\nYou can view the project here: ${studentProjectPageLink}\n\nThe project lead has been notified to confirm your final assignment.\n\nThank you for applying.`;
        const studentHtml = `<p>Hello ${submission.name},</p><p>Your application to join the EIAS program ${submission.projectTitle ? `for the research project <strong>${submission.projectTitle}</strong> ` : ""}has been accepted by the admin team.</p><p>You can view the project here: <a href="${studentProjectPageLink}">${studentProjectPageLink}</a></p><p>The project lead has been notified to confirm your final assignment.</p><p>Thank you for applying.</p>`;
        await sendMail({
          to: submission.email,
          subject: studentSubject,
          text: studentText,
          html: studentHtml,
        });

        if (submission.phone) {
          sendSMS(
            submission.phone,
            `✅ Congrats ${submission.name}! Your EIAS application${submission.projectTitle ? ` for "${submission.projectTitle}"` : ""} has been accepted. The project lead will confirm your assignment shortly.`,
          ).catch(() => {});
        }
        if (ADMIN_PHONE_NUMBER) {
          sendSMS(
            ADMIN_PHONE_NUMBER,
            `✅ You accepted ${submission.name}'s EIAS application${submission.projectTitle ? ` for "${submission.projectTitle}"` : ""}. Lead notification email sent.`,
          ).catch(() => {});
        }

        if (submission.projectLeadEmail) {
          const confirmLink = `${FRONTEND_URL}/lead-confirm?token=${encodeURIComponent(leadConfirmationToken)}`;
          let projectSlug = submission.projectSlug || "";
          let projectPageLink = `${FRONTEND_URL}/projects`;
          if (!projectSlug && submission.projectId) {
            const project = await projectsCollection.findOne(
              { _id: new ObjectId(submission.projectId) },
              { projection: { slug: 1 } },
            );
            projectSlug = project?.slug || "";
          }
          if (projectSlug) {
            projectPageLink = `${FRONTEND_URL}/projects/${projectSlug}`;
          } else if (submission.projectId) {
            projectPageLink = `${FRONTEND_URL}/projects/${submission.projectId}`;
          }

          let existingMembersText = "None yet";
          let existingMembersHtml = "<em>None yet</em>";

          if (submission.projectId) {
            const members = await projectMembersCollection
              .aggregate([
                { $match: { projectId: submission.projectId } },
                {
                  $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                  },
                },
                { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                {
                  $project: {
                    _id: 0,
                    name: { $ifNull: ["$user.name", "$name"] },
                    role: 1,
                  },
                },
              ])
              .toArray();

            const names = members
              .map((member) => member.name)
              .filter(Boolean);
            if (names.length > 0) {
              existingMembersText = names.join(", ");
              existingMembersHtml = names
                .map((name) => `<strong>${name}</strong>`)
                .join(", ");
            }
          }

          const leadSubject = `Action Required: Confirm ${submission.name} for EIAS ${submission.projectTitle || "Research Project"}`;
          const leadText = `Hello,\n\nStudent ${submission.name} (${submission.email}) has been accepted by the Admin for the EIAS program and has requested to join your project: ${submission.projectTitle || "N/A"}.\n\nProject page: ${projectPageLink}\n\nCurrent team members: ${existingMembersText}.\n\nPlease click the link below to confirm their assignment:\n${confirmLink}\n\nThank you.`;
          const leadHtml = `<p>Hello,</p><p>Student <strong>${submission.name}</strong> (<a href="mailto:${submission.email}">${submission.email}</a>) has been accepted by the Admin for the EIAS program and has requested to join your project: ${submission.projectTitle ? `<strong>${submission.projectTitle}</strong>` : "N/A"}.</p><p>Project page: <a href="${projectPageLink}">${projectPageLink}</a></p><p>Current team members: ${existingMembersHtml}.</p><p><span style="display:inline-flex;align-items:center;gap:0.25rem;padding:4px 8px;background:#f8ebdf;color:#92400e;border-radius:999px;font-size:0.9rem;font-weight:600;">NEW</span> <strong>${submission.name}</strong> is requesting to join.</p><p><a href="${confirmLink}" style="background-color:#2563eb;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Confirm Assignment</a></p><p>If the button doesn't work, copy this link: ${confirmLink}</p><p>Thank you.</p>`;
          console.log('📧 Lead assignment email links:', { projectPageLink, confirmLink });
          await sendMail({
            to: submission.projectLeadEmail,
            subject: leadSubject,
            text: leadText,
            html: leadHtml,
          });
        }
      }

      res.json({ submission: result.value });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

app.post("/api/form-submissions/lead-confirm", async (req, res) => {
  try {
    const token = req.query.token || req.body.token;
    if (!token)
      return res.status(400).json({ error: "Confirmation token is required" });

    const submission = await formSubmissionsCollection.findOne({
      leadConfirmationToken: token,
    });
    if (!submission)
      return res
        .status(404)
        .json({ error: "Invalid or expired confirmation token" });
    if (submission.leadRequestStatus === "confirmed")
      return res.json({ message: "This request has already been confirmed." });

    const updated = await formSubmissionsCollection.findOneAndUpdate(
      { _id: submission._id },
      {
        $set: {
          leadRequestStatus: "confirmed",
          status: "assigned",
          leadResponseAt: new Date(),
          assignedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );
    if (!updated.value)
      return res.status(500).json({ error: "Unable to confirm assignment" });

    const studentUserEmail = updated.value.email.toLowerCase().trim();
    let studentUser = await usersCollection.findOne({ email: studentUserEmail });
    if (!studentUser) {
      const result = await usersCollection.insertOne({
        name: updated.value.name || "Research Student",
        email: studentUserEmail,
        passwordHash: await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10),
        role: "student",
        createdAt: new Date(),
      });
      studentUser = await usersCollection.findOne({ _id: result.insertedId });
    }

    if (updated.value.projectId && studentUser) {
      const existingMember = await projectMembersCollection.findOne({
        projectId: updated.value.projectId,
        userId: studentUser._id,
      });
      if (!existingMember) {
        await projectMembersCollection.insertOne({
          projectId: updated.value.projectId,
          userId: studentUser._id,
          role: updated.value.role || "Student",
          createdAt: new Date(),
        });
      }
    }

    let confirmedProjectSlug = updated.value.projectSlug || "";
    let confirmedProjectPageLink = `${FRONTEND_URL}/projects`;
    if (!confirmedProjectSlug && updated.value.projectId) {
      const project = await projectsCollection.findOne(
        { _id: new ObjectId(updated.value.projectId) },
        { projection: { slug: 1 } },
      );
      confirmedProjectSlug = project?.slug || "";
    }
    if (confirmedProjectSlug) {
      confirmedProjectPageLink = `${FRONTEND_URL}/projects/${confirmedProjectSlug}`;
    } else if (updated.value.projectId) {
      confirmedProjectPageLink = `${FRONTEND_URL}/projects/${updated.value.projectId}`;
    }
    const studentSubject = "Your research project assignment is confirmed";
    const studentText = `Hello ${updated.value.name},\n\nGood news: the project lead has confirmed your assignment to ${updated.value.projectTitle || "the requested research project"}. You are now part of that research effort.\n\nYou can view the project here: ${confirmedProjectPageLink}\n\nBest of luck.`;
    const studentHtml = `<p>Hello ${updated.value.name},</p><p>Good news: the project lead has confirmed your assignment to ${updated.value.projectTitle ? `<strong>${updated.value.projectTitle}</strong>` : "the requested research project"}.</p><p>You can view the project here: <a href="${confirmedProjectPageLink}">${confirmedProjectPageLink}</a></p><p>You are now part of that research effort.</p><p>Best of luck.</p>`;
    await sendMail({
      to: updated.value.email,
      subject: studentSubject,
      text: studentText,
      html: studentHtml,
    });

    res.json({
      message: "Thank you. The lead has confirmed the student assignment.",
      submission: updated.value,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete(
  "/api/form-submissions/:id",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id))
        return res.status(400).json({ error: "Invalid submission ID" });
      const result = await formSubmissionsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount === 0)
        return res.status(404).json({ error: "Submission not found" });
      res.json({ success: true, message: "Submission deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

async function start() {
  await connectDB();

  // Listen immediately so the port is open and health checks pass
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });

  // Run background tasks after server is up
  setImmediate(async () => {
    try {
      console.log(
        "\n🔧 Syncing project team members (lead email, falling back to creator)...",
      );
      const synced = await backfillMissingTeamMembers();
      if (synced > 0)
        console.log(
          `✅ Added ${synced} projects' leads/creators to team members`,
        );

      await loadScraperModule();

      const count = await articlesCollection.countDocuments();
      if (count === 0) {
        console.log(
          "\n📭 Database empty. Running initial scrape in background...\n",
        );
        scrapeAll().catch(console.error);
      } else {
        console.log(`\n📊 Database has ${count} articles.`);
      }

      startCronJob();
    } catch (err) {
      console.error("Background init error:", err);
    }
  });
}

start().catch(console.error);

export default app;
