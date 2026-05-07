import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { MongoClient, ObjectId } from 'mongodb';
import { scrapeAll, startCronJob } from './scraper.js';
import { createServer } from 'net';

const PORT = parseInt(process.env.PORT || '4000', 10);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const DB_NAME = process.env.DB_NAME || 'research';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

let usersCollection;
let projectsCollection;
let projectMembersCollection;
let labsCollection;
let articlesCollection;
let tagsCollection;
let formSubmissionsCollection;

const USER_ROLES = ['admin', 'researcher', 'student'];
const PROJECT_STATUSES = ['draft', 'review', 'published'];

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  usersCollection = db.collection('users');
  projectsCollection = db.collection('projects');
  projectMembersCollection = db.collection('project_members');
  labsCollection = db.collection('labs');
  articlesCollection = db.collection('articles');
  tagsCollection = db.collection('tags');
  formSubmissionsCollection = db.collection('form_submissions');

  await usersCollection.createIndex({ email: 1 }, { unique: true });
  await labsCollection.createIndex({ name: 1 }, { unique: true });
  await articlesCollection.createIndex({ slug: 1 }, { unique: true, sparse: true });
  await articlesCollection.createIndex({ title: 'text', description: 'text', content: 'text', category: 'text' });
  await projectsCollection.createIndex({ slug: 1 }, { unique: true, sparse: true });
  await projectsCollection.createIndex({ title: 'text', description: 'text', tags: 'text' });
  await projectMembersCollection.createIndex({ projectId: 1 });
  await projectMembersCollection.createIndex({ userId: 1 });
  await tagsCollection.createIndex({ name: 1 }, { unique: true });
  await formSubmissionsCollection.createIndex({ createdAt: -1 });
  await formSubmissionsCollection.createIndex({ email: 1 }, { unique: true });
  await formSubmissionsCollection.createIndex({ id: 1 }, { unique: true });

  // Ensure default admin account exists
  const defaultAdminEmail = 'haseebmine24@gmail.com';
  const defaultAdminPassword = 'ADYALAROAD';
  const existingAdmin = await usersCollection.findOne({ email: defaultAdminEmail });
  const passwordHash = await bcrypt.hash(defaultAdminPassword, 10);

  if (!existingAdmin) {
    await usersCollection.insertOne({
      name: 'System Admin',
      email: defaultAdminEmail,
      passwordHash,
      role: 'admin',
      createdAt: new Date(),
    });
    console.log(`✅ Default admin account seeded: ${defaultAdminEmail}`);
  } else {
    // Ensure the password and role are always correct for this specific account
    await usersCollection.updateOne(
      { email: defaultAdminEmail },
      { $set: { passwordHash, role: 'admin' } }
    );
    console.log(`✅ Admin credentials synchronized for: ${defaultAdminEmail}`);
  }

  console.log(`✅ Connected to MongoDB ${DB_NAME}`);
}

function createToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: '8h',
  });
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

const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || (EMAIL_USER ? `"MIT Research Lab" <${EMAIL_USER}>` : '"MIT Research Lab" <noreply@research.lab>');
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// Debug: Log environment variables
console.log('\n📧 Email Configuration:');
console.log(`   EMAIL_USER: ${EMAIL_USER ? '✅ ' + EMAIL_USER : '❌ NOT SET'}`);
console.log(`   EMAIL_PASS: ${EMAIL_PASS ? '✅ Set (' + EMAIL_PASS.length + ' chars)' : '❌ NOT SET'}`);
console.log(`   EMAIL_FROM: ${EMAIL_FROM}\n`);

const mailTransporter = EMAIL_USER && EMAIL_PASS ? nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465 || process.env.EMAIL_SECURE === 'true',
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
}) : null;

if (mailTransporter) {
  mailTransporter.verify((error) => {
    if (error) {
      console.error('❌ Email Auth Error (535): The App Password "EMAIL_PASS" is invalid.');
      console.log('👉 To fix: Set EMAIL_USER and EMAIL_PASS environment variables with valid Gmail credentials.');
      console.log('👉 Go to Google Account > Security > App Passwords and generate a new one.');
    } else {
      console.log('✅ Email service is authenticated and ready.');
    }
  });
} else {
  console.log('⚠️  Email service not configured. Set EMAIL_USER and EMAIL_PASS to enable email notifications.');
}

async function sendMail({ to, subject, html, text }) {
  if (!mailTransporter || !EMAIL_USER || !EMAIL_PASS) {
    console.warn('⚠️  Email credentials not configured; skipping email to:', to);
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
    console.error('Failed to send email:', err);
  }
}

function createConfirmationToken() {
  return crypto.randomBytes(24).toString('hex');
}

function isAuthorizedEditor(user) {
  return user && (user.role === 'admin' || user.role === 'researcher');
}

function validateUserRole(role) {
  return USER_ROLES.includes(role);
}

function validateProjectStatus(status) {
  return PROJECT_STATUSES.includes(status);
}

async function parseAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await usersCollection.findOne({ _id: new ObjectId(payload.id) });
    return sanitizeUser(user);
  } catch (err) {
    return null;
  }
}

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await usersCollection.findOne({ _id: new ObjectId(payload.id) });
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = sanitizeUser(user);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ---- Auth ----
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await usersCollection.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Count actual users (not default seeded admin)
    const totalUsers = await usersCollection.countDocuments();
    // If only 1 user exists (the default admin), new signup becomes admin too
    const role = totalUsers <= 1 ? 'admin' : 'student';
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await usersCollection.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createToken(user);
    res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// ---- Users ----
app.get('/api/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await usersCollection.find({}, { projection: { passwordHash: 0 } }).toArray();
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', authenticate, requireAdmin, async (req, res) => {
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
      return res.status(400).json({ error: 'Invalid user role' });
    }

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after', projection: { passwordHash: 0 } }
    );

    if (!result.value) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Projects ----
app.get('/api/projects', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { q, lab, tag, year, status, featured } = req.query;
    const filter = {};

    if (lab && ObjectId.isValid(lab)) {
      filter.labId = new ObjectId(lab);
    }
    if (tag) {
      filter.tags = tag;
    }
    if (featured === 'true') {
      filter.featured = true;
    }
    if (status && validateProjectStatus(status)) {
      if (status !== 'published') {
        const currentUser = await parseAuthUser(req);
        if (!currentUser || currentUser.role !== 'admin') {
          return res.status(403).json({ error: 'Admin access is required to query non-published projects' });
        }
      }
      filter.status = status;
    } else {
      // Default: show only published projects for non-authenticated users
      const currentUser = await parseAuthUser(req);
      if (!currentUser || currentUser.role !== 'admin') {
        filter.status = 'published';
      }
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
    if (q) {
      filter.$text = { $search: q };
    }

    const total = await projectsCollection.countDocuments(filter);
    const projects = await projectsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json({ projects, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/team-members', async (req, res) => {
  try {
    const members = await projectMembersCollection
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $group: {
            _id: '$user._id',
            name: { $first: '$user.name' },
            email: { $first: '$user.email' },
            roles: { $addToSet: '$role' },
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

app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await fetchProjectWithTeam(id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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
          from: 'project_members',
          localField: '_id',
          foreignField: 'projectId',
          as: 'members',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'members.userId',
          foreignField: '_id',
          as: 'userRecords',
        },
      },
      {
        $addFields: {
          team: {
            $map: {
              input: '$members',
              as: 'member',
              in: {
                role: '$$member.role',
                user: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$userRecords',
                        cond: { $eq: ['$$this._id', '$$member.userId'] },
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
      {
        $project: {
          members: 0,
          userRecords: 0,
          'team.user.passwordHash': 0,
        },
      },
    ])
    .toArray();

  const project = results[0] || null;
  if (project && project.team) {
    console.log(`✅ Project "${project.title}" has ${project.team.length} team members`);
  } else if (project) {
    console.log(`⚠️  Project "${project.title}" has NO team members set`);
  }
  return project;
}

app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await fetchProjectWithTeam(id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    let userId;
    const authUser = await parseAuthUser(req);

    if (authUser) {
      userId = new ObjectId(authUser._id);
    } else {
      const { lead, email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required for unauthenticated submissions' });

      const normalizedEmail = email.toLowerCase().trim();
      let user = await usersCollection.findOne({ email: normalizedEmail });
      if (!user) {
        const result = await usersCollection.insertOne({
          name: lead || 'Anonymous Researcher',
          email: normalizedEmail,
          role: 'researcher',
          createdAt: new Date(),
        });
        userId = result.insertedId;
      } else {
        userId = user._id;
      }
    }

    const title = req.body.title?.trim();
    if (!title) return res.status(400).json({ error: 'Project title is required' });

    const status = validateProjectStatus(req.body.status) ? req.body.status : 'draft';
    const tags = Array.isArray(req.body.tags) ? req.body.tags : [];
    const featured = req.body.featured === true;
    const coverImage = req.body.coverImage || req.body.cover_image || '';
    const description = req.body.description || '';

    const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = await generateUniqueSlug(projectsCollection, slugBase);

    const project = {
      title,
      description,
      coverImage,
      status,
      tags,
      labId: req.body.labId && ObjectId.isValid(req.body.labId) ? new ObjectId(req.body.labId) : null,
      createdBy: userId,
      lead: req.body.lead || '',
      leadEmail: req.body.email ? req.body.email.toLowerCase().trim() : '',
      createdAt: new Date(),
      updatedAt: new Date(),
      featured,
      slug,
    };

    const result = await projectsCollection.insertOne(project);
    const created = await projectsCollection.findOne({ _id: result.insertedId });

    // Handle team members - can be { name, role } or { userId, role } or just userId string
    const teamMembersInput = Array.isArray(req.body.teamMembers) ? req.body.teamMembers : [];
    const projectMemberDocs = [];

    for (const member of teamMembersInput) {
      let userId;

      if (typeof member === 'string') {
        // Direct userId string
        if (ObjectId.isValid(member)) {
          userId = new ObjectId(member);
        }
      } else if (member.userId && ObjectId.isValid(member.userId)) {
        // Already has userId (from database)
        userId = new ObjectId(member.userId);
      } else if (member.name) {
        // Has name - need to look up or create user
        const trimmedName = member.name.trim();
        let user = await usersCollection.findOne({ name: trimmedName });
        if (!user) {
          // Create new user for this team member
          const result = await usersCollection.insertOne({
            name: trimmedName,
            email: `${trimmedName.toLowerCase().replace(/\s+/g, '.')}@mit.edu`,
            role: 'researcher',
            createdAt: new Date(),
          });
          userId = result.insertedId;
          console.log(`✅ Created new user for team member: ${trimmedName}`);
        } else {
          userId = user._id;
        }
      }

      if (userId) {
        projectMemberDocs.push({
          projectId: result.insertedId,
          userId,
          role: member.role || 'Researcher',
          createdAt: new Date(),
        });
      }
    }

    if (projectMemberDocs.length > 0) {
      await projectMembersCollection.insertMany(projectMemberDocs);
      console.log(`✅ Added ${projectMemberDocs.length} team members to project`);
    }

    // Auto-add project lead as team member if leadEmail is provided
    if (project.leadEmail) {
      const leadUser = await usersCollection.findOne({ email: project.leadEmail.toLowerCase() });
      if (leadUser) {
        const leadExists = await projectMembersCollection.findOne({
          projectId: result.insertedId,
          userId: leadUser._id,
        });
        if (!leadExists) {
          await projectMembersCollection.insertOne({
            projectId: result.insertedId,
            userId: leadUser._id,
            role: 'Lead Researcher',
            createdAt: new Date(),
          });
        }
      }
    }

    const full = await fetchProjectWithTeam(created._id.toString());
    res.status(201).json({ project: full });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/projects/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid project id' });
    if (!validateProjectStatus(status)) return res.status(400).json({ error: 'Invalid project status' });

    const result = await projectsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result.value) return res.status(404).json({ error: 'Project not found' });
    res.json({ project: result.value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid project id' });

    const updates = { updatedAt: new Date() };

    if (req.body.title) updates.title = req.body.title.trim();
    if (req.body.description) updates.description = req.body.description;
    if (req.body.coverImage || req.body.cover_image) {
      updates.coverImage = req.body.coverImage || req.body.cover_image;
    }
    if (req.body.tags) {
      updates.tags = Array.isArray(req.body.tags) ? req.body.tags : [];
    }
    if (req.body.featured !== undefined) {
      updates.featured = req.body.featured === true;
    }
    if (req.body.status && validateProjectStatus(req.body.status)) {
      updates.status = req.body.status;
    }
    if (req.body.labId && ObjectId.isValid(req.body.labId)) {
      updates.labId = new ObjectId(req.body.labId);
    }
    if (req.body.leadEmail) {
      updates.leadEmail = req.body.leadEmail.toLowerCase().trim();
    }

    const result = await projectsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result.value) return res.status(404).json({ error: 'Project not found' });

    if (Array.isArray(req.body.teamMembers)) {
      await projectMembersCollection.deleteMany({ projectId: new ObjectId(id) });
      const teamMembersInput = req.body.teamMembers;
      const newMemberDocs = [];

      for (const member of teamMembersInput) {
        let userId;

        if (typeof member === 'string') {
          // Direct userId string
          if (ObjectId.isValid(member)) {
            userId = new ObjectId(member);
          }
        } else if (member.userId && ObjectId.isValid(member.userId)) {
          // Already has userId (from database)
          userId = new ObjectId(member.userId);
        } else if (member.name) {
          // Has name - need to look up or create user
          const trimmedName = member.name.trim();
          let user = await usersCollection.findOne({ name: trimmedName });
          if (!user) {
            // Create new user for this team member
            const insertResult = await usersCollection.insertOne({
              name: trimmedName,
              email: `${trimmedName.toLowerCase().replace(/\s+/g, '.')}@mit.edu`,
              role: 'researcher',
              createdAt: new Date(),
            });
            userId = insertResult.insertedId;
            console.log(`✅ Created new user for team member: ${trimmedName}`);
          } else {
            userId = user._id;
          }
        }

        if (userId) {
          newMemberDocs.push({
            projectId: new ObjectId(id),
            userId,
            role: member.role || 'Researcher',
            createdAt: new Date(),
          });
        }
      }

      if (newMemberDocs.length > 0) {
        await projectMembersCollection.insertMany(newMemberDocs);
        console.log(`✅ Updated ${newMemberDocs.length} team members for project`);
      }
    }

    // Auto-add project lead as team member if leadEmail is provided
    const updatedProject = result.value;
    if (updatedProject.leadEmail) {
      const leadUser = await usersCollection.findOne({ email: updatedProject.leadEmail.toLowerCase() });
      if (leadUser) {
        const leadExists = await projectMembersCollection.findOne({
          projectId: new ObjectId(id),
          userId: leadUser._id,
        });
        if (!leadExists) {
          await projectMembersCollection.insertOne({
            projectId: new ObjectId(id),
            userId: leadUser._id,
            role: 'Lead Researcher',
            createdAt: new Date(),
          });
        }
      }
    }

    const project = await fetchProjectWithTeam(id);
    res.json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid project id' });
    const result = await projectsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Labs ----
app.get('/api/labs', async (req, res) => {
  try {
    const labs = await labsCollection.find({}).sort({ name: 1 }).toArray();
    res.json({ labs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/labs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid lab id' });
    const lab = await labsCollection.findOne({ _id: new ObjectId(id) });
    if (!lab) return res.status(404).json({ error: 'Lab not found' });
    res.json({ lab });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/labs', authenticate, requireAdmin, async (req, res) => {
  try {
    const lab = {
      name: req.body.name,
      description: req.body.description || '',
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

app.put('/api/labs/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid lab id' });
    const updates = { ...req.body, updatedAt: new Date() };
    const result = await labsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ error: 'Lab not found' });
    res.json({ lab: result.value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/labs/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid lab id' });
    const result = await labsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Lab not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Tags ----
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await tagsCollection.find({}).sort({ name: 1 }).toArray();
    res.json({ tags });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tags', authenticate, requireAdmin, async (req, res) => {
  try {
    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ error: 'Tag name is required' });
    const existing = await tagsCollection.findOne({ name });
    if (existing) return res.status(400).json({ error: 'Tag already exists' });
    const result = await tagsCollection.insertOne({ name, createdAt: new Date() });
    res.status(201).json({ tag: await tagsCollection.findOne({ _id: result.insertedId }) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Articles ----
app.get('/api/articles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.category) filter.category = req.query.category;
    if (req.query.q) {
      filter.$text = { $search: req.query.q };
    }

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

app.get('/api/articles/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const categories = ['Research', 'Science', 'Media Lab', 'AI', 'Robotics', 'Health', 'Technology'];
    const articles = await articlesCollection
      .find({
        image: { $ne: '', $exists: true, $type: 'string', $regex: '.+' },
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

app.get('/api/articles/:slug', async (req, res) => {
  try {
    const article = await articlesCollection.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json({ article });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/articles/:slug/related', async (req, res) => {
  try {
    const article = await articlesCollection.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const related = await articlesCollection
      .find({
        slug: { $ne: article.slug },
        image: { $ne: '', $exists: true, $type: 'string', $regex: '.+' },
        $or: [
          { category: article.category },
          { title: { $regex: article.title.split(' ').slice(0, 3).join('|'), $options: 'i' } },
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

app.post('/api/articles', authenticate, requireAdmin, async (req, res) => {
  try {
    const rawSlug = req.body.slug || req.body.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = await generateUniqueSlug(articlesCollection, rawSlug);

    const article = {
      title: req.body.title,
      slug,
      description: req.body.description || '',
      content: req.body.content || [],
      image: req.body.image || '',
      category: req.body.category || 'Research',
      publishDate: req.body.publishDate ? new Date(req.body.publishDate) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await articlesCollection.insertOne(article);
    res.status(201).json({ article: await articlesCollection.findOne({ _id: result.insertedId }) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/articles/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid article id' });
    const updates = { ...req.body, updatedAt: new Date() };
    if (updates.slug) {
      updates.slug = await generateUniqueSlug(articlesCollection, updates.slug, id);
    }
    const result = await articlesCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ error: 'Article not found' });
    res.json({ article: result.value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/articles/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid article id' });
    const result = await articlesCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Article not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Search ----
app.get('/api/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ results: [], query: '' });

    const articleResults = await articlesCollection
      .find({ $text: { $search: q } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(30)
      .toArray();

    const projectResults = await projectsCollection
      .find({ $text: { $search: q } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(30)
      .toArray();

    const results = [
      ...articleResults.map((a) => ({ ...a, resultType: 'article' })),
      ...projectResults.map((p) => ({ ...p, resultType: 'project' })),
    ];

    res.json({ query: q, articles: articleResults, projects: projectResults, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Scrape ----
app.post('/api/scrape', async (req, res) => {
  try {
    res.json({ status: 'scraping started' });
    scrapeAll()
      .then((result) => {
        console.log('Scrape complete:', result);
      })
      .catch((err) => {
        console.error('Scrape error:', err);
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const totalArticles = await articlesCollection.countDocuments();
    const totalProjects = await projectsCollection.countDocuments();
    const categories = await articlesCollection.distinct('category');
    const lastArticle = await articlesCollection.find({}).sort({ createdAt: -1 }).limit(1).toArray();
    const lastScraped = lastArticle[0]?.createdAt || null;
    res.json({ totalArticles, totalProjects, categories, lastScraped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: 'connected' });
});

// ---- Utility: Populate team members for projects without them ----
app.post('/api/fix-missing-team-members', authenticate, requireAdmin, async (req, res) => {
  try {
    const projectsWithoutTeam = await projectsCollection
      .find({ $or: [{ team: { $exists: false } }, { team: [] }] })
      .toArray();

    let updated = 0;
    for (const project of projectsWithoutTeam) {
      if (project.leadEmail) {
        const lead = await usersCollection.findOne({ email: project.leadEmail.toLowerCase() });
        if (lead) {
          const existing = await projectMembersCollection.findOne({
            projectId: project._id,
            userId: lead._id,
          });
          if (!existing) {
            await projectMembersCollection.insertOne({
              projectId: project._id,
              userId: lead._id,
              role: 'Lead Researcher',
              createdAt: new Date(),
            });
            updated++;
            console.log(`✅ Added lead ${project.leadEmail} to project "${project.title}"`);
          }
        }
      }
    }
    res.json({ success: true, message: `Updated ${updated} projects with team members` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Form Submissions ----
app.post('/api/form-submissions', async (req, res) => {
  try {
    const { name, email, phone, id, qualifications, experience, motivation, university, program, otherInfo, projectId } = req.body;

    if (!name || !email || !phone || !id) {
      return res.status(400).json({ error: 'Name, email, phone, and ID are required' });
    }

    // Check for duplicate entries (Email or ID/Passport)
    const existingSubmission = await formSubmissionsCollection.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { id: id.trim() }],
    });
    if (existingSubmission) {
      return res.status(400).json({ error: 'An application with this email or ID/Passport already exists.' });
    }

    let projectTitle = '';
    let projectLeadEmail = '';
    if (projectId && ObjectId.isValid(projectId)) {
      const project = await projectsCollection.findOne({ _id: new ObjectId(projectId) });
      if (project) {
        projectTitle = project.title || '';
        projectLeadEmail = project.leadEmail || '';
      }
    }

    const submission = {
      name,
      email: email.toLowerCase().trim(),
      phone,
      id,
      qualifications: qualifications || '',
      experience: experience || '',
      motivation: motivation || '',
      university: university || '',
      program: program || '',
      otherInfo: otherInfo || '',
      projectId: projectId && ObjectId.isValid(projectId) ? new ObjectId(projectId) : null,
      projectTitle,
      projectLeadEmail: projectLeadEmail.toLowerCase().trim(),
      leadRequestStatus: 'not-requested',
      leadConfirmationToken: null,
      leadResponseAt: null,
      assignedAt: null,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await formSubmissionsCollection.insertOne(submission);
    res.status(201).json({ success: true, message: 'Form submitted successfully', id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/form-submissions', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'all';
    const searchQuery = req.query.search || '';

    const filter = {};
    if (status !== 'all') filter.status = status;
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
        { phone: { $regex: searchQuery, $options: 'i' } },
        { id: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    const total = await formSubmissionsCollection.countDocuments(filter);
    const submissions = await formSubmissionsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json({ submissions, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/form-submissions-stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const total = await formSubmissionsCollection.countDocuments();
    const statusStats = await formSubmissionsCollection
      .aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
      .toArray();

    const byStatus = {};
    statusStats.forEach((item) => {
      byStatus[item._id || 'new'] = item.count;
    });

    res.json({ total, byStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/form-submissions/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }
    const submission = await formSubmissionsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    res.json({ submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/form-submissions/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    const { status, notes } = req.body;
    const validStatuses = ['new', 'reviewing', 'contacted', 'rejected', 'accepted'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existing = await formSubmissionsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!existing) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    updates.updatedAt = new Date();

    let leadConfirmationToken = existing.leadConfirmationToken;
    if (status === 'accepted' && existing.status !== 'accepted') {
      if (existing.projectLeadEmail) {
        leadConfirmationToken = createConfirmationToken();
        updates.leadRequestStatus = 'pending';
        updates.leadConfirmationToken = leadConfirmationToken;
      } else {
        updates.leadRequestStatus = 'not-required';
      }
    }

    const result = await formSubmissionsCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    // Compatibility fix: handles both old and new MongoDB driver versions
    const submission = result.value !== undefined ? result.value : result;
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    if (status === 'accepted' && existing.status !== 'accepted') {
      console.log(`📧 Processing acceptance emails for student: ${submission.email}`);

      const studentSubject = 'Your EIAS program request has been accepted';
      const studentText = `Hello ${submission.name},\n\nYour application to join the EIAS program ${submission.projectTitle ? `for the research project "${submission.projectTitle}" ` : ''}has been accepted by the admin team. The project lead has been notified to confirm your final assignment.\n\nThank you for applying.`;
      const studentHtml = `<p>Hello ${submission.name},</p><p>Your application to join the EIAS program ${submission.projectTitle ? `for the research project <strong>${submission.projectTitle}</strong> ` : ''}has been accepted by the admin team.</p><p>The project lead has been notified to confirm your final assignment.</p><p>Thank you for applying.</p>`;
      await sendMail({ to: submission.email, subject: studentSubject, text: studentText, html: studentHtml });

      if (submission.projectLeadEmail) {
        const leadSubject = `Action Required: Confirm ${submission.name} for EIAS ${submission.projectTitle || 'Research Project'}`;
        const confirmLink = `${APP_URL}/lead-confirm?token=${encodeURIComponent(leadConfirmationToken)}`;
        const leadText = `Hello,\n\nStudent ${submission.name} (${submission.email}) has been accepted by the Admin for the EIAS program and has requested to join your project: ${submission.projectTitle || 'N/A'}.\n\nPlease click the link below to confirm their assignment:\n${confirmLink}\n\nOnce you confirm, the student will be officially assigned and notified.\n\nThank you.`;
        const leadHtml = `<p>Hello,</p><p>Student <strong>${submission.name}</strong> (<a href="mailto:${submission.email}">${submission.email}</a>) has been accepted by the Admin for the EIAS program and has requested to join your project: ${submission.projectTitle ? `<strong>${submission.projectTitle}</strong>` : 'N/A'}.</p><p><strong>Click the link below to confirm this assignment:</strong></p><p><a href="${confirmLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Assignment</a></p><p>If the button doesn't work, copy this link: ${confirmLink}</p><p>Thank you.</p>`;
        await sendMail({ to: submission.projectLeadEmail, subject: leadSubject, text: leadText, html: leadHtml });
      }
    }

    res.json({ submission: result.value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/form-submissions/lead-confirm', async (req, res) => {
  try {
    const token = req.query.token || req.body.token;
    if (!token) {
      return res.status(400).json({ error: 'Confirmation token is required' });
    }

    const submission = await formSubmissionsCollection.findOne({ leadConfirmationToken: token });
    if (!submission) {
      return res.status(404).json({ error: 'Invalid or expired confirmation token' });
    }

    if (submission.leadRequestStatus === 'confirmed') {
      return res.json({ message: 'This request has already been confirmed.' });
    }

    const updated = await formSubmissionsCollection.findOneAndUpdate(
      { _id: submission._id },
      {
        $set: {
          leadRequestStatus: 'confirmed',
          status: 'assigned',
          leadResponseAt: new Date(),
          assignedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!updated.value) {
      return res.status(500).json({ error: 'Unable to confirm assignment' });
    }

    const studentSubject = 'Your research project assignment is confirmed';
    const studentText = `Hello ${updated.value.name},\n\nGood news: the project lead has confirmed your assignment to ${updated.value.projectTitle || 'the requested research project'}. You are now part of that research effort.\n\nBest of luck.`;
    const studentHtml = `<p>Hello ${updated.value.name},</p><p>Good news: the project lead has confirmed your assignment to ${updated.value.projectTitle ? `<strong>${updated.value.projectTitle}</strong>` : 'the requested research project'}.</p><p>You are now part of that research effort.</p><p>Best of luck.</p>`;
    await sendMail({ to: updated.value.email, subject: studentSubject, text: studentText, html: studentHtml });

    res.json({ message: 'Thank you. The lead has confirmed the student assignment.', submission: updated.value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/form-submissions/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    const result = await formSubmissionsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Submission not found' });

    res.json({ success: true, message: 'Submission deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ---- Helper: find a free port ----
function findFreePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findFreePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
}

async function start() {
  await connectDB();

  // Auto-fix: Ensure all projects with leadEmail have them as team members
  console.log('\n🔧 Syncing project team members with lead emails...');
  const projectsWithLead = await projectsCollection
    .find({ leadEmail: { $exists: true, $ne: '' } })
    .toArray();
  let synced = 0;

  for (const project of projectsWithLead) {
    const lead = await usersCollection.findOne({ email: project.leadEmail.toLowerCase() });
    if (lead) {
      const existing = await projectMembersCollection.findOne({
        projectId: project._id,
        userId: lead._id,
      });
      if (!existing) {
        await projectMembersCollection.insertOne({
          projectId: project._id,
          userId: lead._id,
          role: 'Lead Researcher',
          createdAt: new Date(),
        });
        synced++;
      }
    }
  }
  if (synced > 0) console.log(`✅ Added ${synced} project leads to team members`);

  const count = await articlesCollection.countDocuments();
  if (count === 0) {
    console.log('\n📭 Database empty. Running initial scrape...\n');
    await scrapeAll();
  } else {
    console.log(`\n📊 Database has ${count} articles.`);
  }

  startCronJob();

  const availablePort = await findFreePort(PORT);

  if (availablePort !== PORT) {
    console.log(`\n⚠️  Port ${PORT} is in use. Starting on port ${availablePort} instead.`);
    console.log(`   Update VITE_API_URL in your frontend .env to: http://localhost:${availablePort}\n`);
  }

  app.listen(availablePort, () => {
    console.log(`🚀 Backend running on http://localhost:${availablePort}`);
    console.log(`   API:     http://localhost:${availablePort}/api/articles`);
    console.log(`   Search:  http://localhost:${availablePort}/api/search?q=robotics`);
    console.log(`   POST http://localhost:${availablePort}/api/scrape\n`);
  });
}

start().catch(console.error);