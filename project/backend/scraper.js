import axios from 'axios';
import Parser from 'rss-parser';
import { MongoClient } from 'mongodb';
import cron from 'node-cron';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'MITnews';
const COLLECTION_NAME = 'mitn';

const FEEDS = [
  // MIT News
  { url: 'https://news.mit.edu/rss/topic/media-lab', source: 'MIT News', category: 'Media Lab' },
  { url: 'https://news.mit.edu/rss/topic/artificial-intelligence', source: 'MIT News', category: 'AI' },
  { url: 'https://news.mit.edu/rss/topic/robotics', source: 'MIT News', category: 'Robotics' },
  { url: 'https://news.mit.edu/rss/topic/machine-learning', source: 'MIT News', category: 'Machine Learning' },
  { url: 'https://news.mit.edu/rss/topic/sustainability', source: 'MIT News', category: 'Sustainability' },

  // Hacker News
  { url: 'https://hnrss.org/frontpage', source: 'Hacker News', category: 'Tech' },
  { url: 'https://hnrss.org/newest', source: 'Hacker News', category: 'Newest' },

  // Dev.to
  { url: 'https://dev.to/feed', source: 'Dev.to', category: 'Programming' },
  { url: 'https://dev.to/t/ai/feed', source: 'Dev.to', category: 'AI' },
  { url: 'https://dev.to/t/programming/feed', source: 'Dev.to', category: 'Programming' },

  // Tech & AI News
  { url: 'https://www.artificialintelligence-news.com/feed/', source: 'AI News', category: 'AI' },
  { url: 'https://www.marktechpost.com/feed/', source: 'MarkTechPost', category: 'AI' },
  { url: 'https://www.unite.ai/feed/', source: 'Unite.AI', category: 'AI' },
  { url: 'https://www.analyticsvidhya.com/feed/', source: 'Analytics Vidhya', category: 'Data Science' },
  { url: 'https://machinelearningmastery.com/blog/feed/', source: 'ML Mastery', category: 'Machine Learning' },

  // Major Tech Publications
  { url: 'https://techcrunch.com/feed/', source: 'TechCrunch', category: 'Tech' },
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge', category: 'Tech' },
  { url: 'https://www.engadget.com/rss.xml', source: 'Engadget', category: 'Tech' },
  { url: 'https://www.cnet.com/rss/news/', source: 'CNET', category: 'Tech' },
  { url: 'https://www.digitaltrends.com/feed/', source: 'Digital Trends', category: 'Tech' },
  { url: 'https://venturebeat.com/feed/', source: 'VentureBeat', category: 'Tech' },
  { url: 'https://www.geekwire.com/feed/', source: 'GeekWire', category: 'Tech' },
  { url: 'https://www.zdnet.com/topic/innovation/rss.xml', source: 'ZDNet', category: 'Tech' },
  { url: 'https://www.techrepublic.com/rssfeeds/articles/', source: 'TechRepublic', category: 'Tech' },
  { url: 'https://www.newatlas.com/index.rss', source: 'New Atlas', category: 'Tech' },

  // Mainstream News Tech
  { url: 'https://rss.cnn.com/rss/edition_technology.rss', source: 'CNN', category: 'Technology' },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC', category: 'Technology' },
  { url: 'https://feeds.skynews.com/feeds/rss/technology.xml', source: 'Sky News', category: 'Technology' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', category: 'News' },
  { url: 'https://feeds.nbcnews.com/nbcnews/public/tech', source: 'NBC News', category: 'Technology' },
  { url: 'https://feeds.reuters.com/reuters/technologyNews', source: 'Reuters', category: 'Technology' },

  // Tech Reviews & Science
  { url: 'https://feeds.arstechnica.com/arstechnica/index', source: 'Ars Technica', category: 'Tech' },
  { url: 'https://thenextweb.com/feed/', source: 'The Next Web', category: 'Tech' },
  { url: 'https://www.sciencedaily.com/rss/top/technology.xml', source: 'ScienceDaily', category: 'Technology' },
  { url: 'https://www.sciencedaily.com/rss/computers_math.xml', source: 'ScienceDaily', category: 'Computers' },
  { url: 'https://phys.org/rss-feed/technology-news/', source: 'Phys.org', category: 'Technology' },
  { url: 'https://rss.sciam.com/ScientificAmerican-Technology', source: 'Scientific American', category: 'Technology' },

  // Google News Aggregates (Time-filtered to get fresh news, not just top hits)
  { url: 'https://news.google.com/rss/search?q=technology&when=d', source: 'Google News', category: 'Technology' },
  { url: 'https://news.google.com/rss/search?q=innovation&when=d', source: 'Google News', category: 'Innovation' },
  { url: 'https://news.google.com/rss/search?q=artificial+intelligence&when=d', source: 'Google News', category: 'AI' },
];

const parser = new Parser({
  customFields: {
    item: ['description', 'content:encoded', 'media:content', 'enclosure'],
  },
});

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'application/rss+xml, application/xml, text/xml, */*',
};

let mongoClient;

async function getDB() {
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
  }
  return mongoClient.db(DB_NAME).collection(COLLECTION_NAME);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getImageFromItem(item) {
  if (item['media:content']?.['$']?.url) return item['media:content']['$'].url;
  if (item.enclosure?.url) return item.enclosure.url;
  if (item['content:encoded']) {
    const match = item['content:encoded'].match(/<img[^>]+src="([^"]+)"/);
    if (match) return match[1];
  }
  if (item.description) {
    const match = item.description.match(/<img[^>]+src="([^"]+)"/);
    if (match) return match[1];
  }
  return '';
}

function cleanText(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract paragraphs from HTML content — returns an array of clean paragraph strings
function extractParagraphs(html) {
  if (!html) return [];
  const paragraphs = [];
  // Split on </p> tags
  const rawParts = html.split(/<\/p>/i);
  for (const part of rawParts) {
    const cleaned = cleanText(part);
    if (cleaned.length > 30) {
      paragraphs.push(cleaned);
    }
  }
  // If no <p> tags found, split by newlines or double spaces
  if (paragraphs.length === 0) {
    const lines = html.split(/\n\n+/).filter(l => l.trim().length > 30);
    for (const line of lines) {
      paragraphs.push(cleanText(line));
    }
  }
  return paragraphs;
}

// ---- Scrape a single RSS feed ----
async function scrapeFeed(feed) {
  console.log(`  📡 Fetching: ${feed.source} (${feed.category})`);
  try {
    // Use axios to fetch XML, then parse manually (avoids rss-parser callback bug)
    const { data: xml } = await axios.get(feed.url, {
      headers: HEADERS,
      timeout: 15000,
      responseType: 'text',
    });
    const feedData = await parser.parseString(xml);
    const items = feedData.items || [];
    console.log(`    → ${items.length} items`);
    return items.map(item => {
      const rawContent = item.content || item['content:encoded'] || item.description || '';
      const paragraphs = extractParagraphs(rawContent);
      return {
        title: cleanText(item.title) || 'Untitled',
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate || '',
        description: cleanText(item.contentSnippet || item.description || '').slice(0, 350),
        content: paragraphs.slice(0, 15), // Store as array of paragraphs
        image: getImageFromItem(item),
        category: feed.category,
        source: feed.source,
        articleUrl: item.link || '',
      };
    });
  } catch (err) {
    console.log(`    ⚠ Failed: ${feed.url} — ${err.message}`);
    return [];
  }
}

// ---- Main scraping function ----
export async function scrapeAll() {
  console.log(`\n🔄 [${new Date().toISOString()}] Starting feed scrape...\n`);
  const allItems = [];

  // Fetch all feeds in parallel
  const results = await Promise.allSettled(FEEDS.map(feed => scrapeFeed(feed)));

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    } else {
      console.log(`  ⚠ Feed ${i} failed: ${result.reason?.message}`);
    }
  });

  if (allItems.length === 0) {
    console.log('\n  📭 No new items fetched.\n');
    return { added: 0, skipped: 0 };
  }

  console.log(`\n  [DB] Checking ${allItems.length} items against database...\n`);

  const db = await getDB();
  let added = 0;
  let skipped = 0;

  for (const item of allItems) {
    // Use link as primary key for deduplication (more reliable than slug)
    const linkSlug = slugify(item.link || item.title);
    const existing = await db.findOne({ linkSlug, source: item.source });

    if (existing) {
      skipped++;
    } else {
      await db.insertOne({
        ...item,
        linkSlug,
        slug: slugify(item.title.slice(0, 100)),
        id: linkSlug,
        excerpt: item.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      added++;
      console.log(`  ✅ [${item.source}] ${item.title.slice(0, 55)}...`);
    }

    await new Promise(r => setTimeout(r, 30));
  }

  console.log(`\n📊 Done! Added: ${added} | Skipped (existing): ${skipped}`);
  return { added, skipped };
}

// ---- Periodic scraping every 1 minute ----
export function startCronJob() {
  cron.schedule('* * * * *', async () => {
    console.log(`\n⏰ [${new Date().toISOString()}] Auto-scrape (every 1 min)`);
    await scrapeAll();
  }, { timezone: 'UTC' });
  console.log('⏰ Auto-scrape scheduled: every 1 minute');
}
