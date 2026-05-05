import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

    const userCount = await usersCollection.countDocuments();
    const role = userCount === 0 ? 'admin' : 'student';
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

  return results[0] || null;
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
          createdAt: new Date()
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
      createdAt: new Date(),
      updatedAt: new Date(),
      featured,
      slug,
    };

    const result = await projectsCollection.insertOne(project);
    const created = await projectsCollection.findOne({ _id: result.insertedId });

    const teamMembersInput = Array.isArray(req.body.teamMembers) ? req.body.teamMembers : [];
    const teamMembers = teamMembersInput.map((member) => {
      if (typeof member === 'string') {
        return { userId: member, role: 'assistant' };
      }
      return { userId: member.userId, role: member.role || 'assistant' };
    });

    const projectMemberDocs = teamMembers
      .filter((member) => ObjectId.isValid(member.userId))
      .map((member) => ({
        projectId: result.insertedId,
        userId: new ObjectId(member.userId),
        role: member.role,
        createdAt: new Date(),
      }));

    if (projectMemberDocs.length > 0) {
      await projectMembersCollection.insertMany(projectMemberDocs);
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

    const result = await projectsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result.value) return res.status(404).json({ error: 'Project not found' });

    if (Array.isArray(req.body.teamMembers)) {
      await projectMembersCollection.deleteMany({ projectId: new ObjectId(id) });
      const newMemberDocs = req.body.teamMembers
        .filter((member) => ObjectId.isValid(member.userId || member))
        .map((member) => ({
          projectId: new ObjectId(id),
          userId: new ObjectId(typeof member === 'string' ? member : member.userId),
          role: typeof member === 'string' ? 'assistant' : member.role || 'assistant',
          createdAt: new Date(),
        }));
      if (newMemberDocs.length > 0) {
        await projectMembersCollection.insertMany(newMemberDocs);
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

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const articleResults = await articlesCollection
      .find({ $or: [{ title: regex }, { description: regex }, { content: regex }, { category: regex }] })
      .sort({ createdAt: -1 })
      .limit(30)
      .toArray();

    const projectResults = await projectsCollection
      .find({ $or: [{ title: regex }, { description: regex }, { tags: regex }] })
      .sort({ createdAt: -1 })
      .limit(30)
      .toArray();

    res.json({ query: q, articles: articleResults, projects: projectResults });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Scrape ----
app.post('/api/scrape', async (req, res) => {
  try {
    res.json({ status: 'scraping started' });
    scrapeAll().then(result => {
      console.log('Scrape complete:', result);
    }).catch(err => {
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

// ---- Form Submissions ----
app.post('/api/form-submissions', async (req, res) => {
  try {
    const { name, email, phone, id, qualifications, experience, motivation, university, program, otherInfo } = req.body;

    if (!name || !email || !phone || !id) {
      return res.status(400).json({ error: 'Name, email, phone, and ID are required' });
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
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date()
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
        { id: { $regex: searchQuery, $options: 'i' } }
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

    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    updates.updatedAt = new Date();

    const result = await formSubmissionsCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result.value) return res.status(404).json({ error: 'Submission not found' });
    res.json({ submission: result.value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/form-submissions/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }
    const result = await formSubmissionsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Submission not found' });
    res.json({ success: true, message: 'Submission deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/form-submissions-stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const total = await formSubmissionsCollection.countDocuments();
    const byStatus = await formSubmissionsCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();

    const statusCounts = {};
    byStatus.forEach(item => { statusCounts[item._id] = item.count; });

    res.json({ total, byStatus: statusCounts });
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
        // Try next port
        resolve(findFreePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
}

async function start() {
  await connectDB();

  const count = await articlesCollection.countDocuments();
  if (count === 0) {
    console.log('\n📭 Database empty. Running initial scrape...\n');
    await scrapeAll();
  } else {
    console.log(`\n📊 Database has ${count} articles.`);
  }

  startCronJob();

  // Find a free port starting from the desired PORT
  const availablePort = await findFreePort(PORT);

  if (availablePort !== PORT) {
    console.log(`\n⚠️  Port ${PORT} is in use. Starting on port ${availablePort} instead.`);
    console.log(`   Update VITE_API_URL in your frontend .env to: http://localhost:${availablePort}\n`);
  }

  app.listen(availablePort, () => {
    console.log(`🚀 Backend running on http://localhost:${availablePort}`);
    console.log(`   API:     http://localhost:${availablePort}/api/articles`);
    console.log(`   Search:  http://localhost:${availablePort}/api/search?q=robotics`);
    console.log(`   Scrape:  POST http://localhost:${availablePort}/api/scrape\n`);
  });
}

start().catch(console.error);