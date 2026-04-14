import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { scrapeAll, startCronJob } from './scraper.js';

const PORT = 4000;
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'MITnews';
const COLLECTION_NAME = 'mitn';

const app = express();
app.use(cors());
app.use(express.json());

let db;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME).collection(COLLECTION_NAME);
  console.log('✅ Connected to MongoDB');
}

// ---- GET all articles (paginated, sorted by date) ----
app.get('/api/articles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await db.countDocuments();
    const articles = await db
      .find({})
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

// ---- GET latest articles (for home page) ----
app.get('/api/articles/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const articles = await db
      .find({ image: { $ne: '', $exists: true, $type: 'string', $regex: '.+' } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    res.json({ articles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- GET single article by slug ----
app.get('/api/articles/:slug', async (req, res) => {
  try {
    const article = await db.findOne({ slug: req.params.slug });
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ article });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- GET related articles ----
app.get('/api/articles/:slug/related', async (req, res) => {
  try {
    const article = await db.findOne({ slug: req.params.slug });
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const related = await db
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

// ---- SEARCH articles (ranked by relevance) ----
app.get('/api/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ results: [], query: '' });

    // Escape special regex chars for safe substring search
    const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQ, 'i');

    // 1. Fetch candidates that match in title, description, or content
    const candidates = await db
      .find({
        $or: [
          { title: regex },
          { description: regex },
          { content: regex },
        ],
        image: { $ne: '', $exists: true, $type: 'string', $regex: '.+' },
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    // 2. Score results for relevance
    const scored = candidates.map((item) => {
      let score = 0;
      
      // Title match is highest priority
      if (item.title && regex.test(item.title)) score += 10;
      // Bonus if title starts with the search term
      if (item.title && new RegExp(`^${escapedQ}`, 'i').test(item.title)) score += 5;
      
      // Description match
      if (item.description && regex.test(item.description)) score += 5;
      
      // Content match (array of paragraphs)
      if (Array.isArray(item.content) && item.content.some(p => regex.test(p))) score += 2;
      
      return { ...item, score };
    });

    // 3. Sort by score (desc), then by date (desc)
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // 4. Return top 30 relevant results
    const results = scored.slice(0, 30).map(({ score, ...rest }) => rest);

    res.json({ results, query: q });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- POST trigger manual scrape ----
app.post('/api/scrape', async (req, res) => {
  try {
    res.json({ status: 'scraping started' });
    // Run in background so we don't block the response
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

// ---- GET scrape stats ----
app.get('/api/stats', async (req, res) => {
  try {
    const total = await db.countDocuments();
    const categories = await db.distinct('category');
    const latest = await db.find({}).sort({ createdAt: -1 }).limit(1).toArray();
    const newestDate = latest[0]?.createdAt || null;

    res.json({ totalArticles: total, categories, lastScraped: newestDate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: db ? 'connected' : 'disconnected' });
});

// ---- Start server ----
async function start() {
  await connectDB();

  // If DB is empty, do initial scrape
  const count = await db.countDocuments();
  if (count === 0) {
    console.log('\n📭 Database empty. Running initial scrape...\n');
    await scrapeAll();
  } else {
    console.log(`\n📊 Database has ${count} articles.`);
  }

  // Start periodic re-scraping
  startCronJob();

  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
    console.log(`   API:     http://localhost:${PORT}/api/articles`);
    console.log(`   Search:  http://localhost:${PORT}/api/search?q=robotics`);
    console.log(`   Scrape:  POST http://localhost:${PORT}/api/scrape\n`);
  });
}

start().catch(console.error);
