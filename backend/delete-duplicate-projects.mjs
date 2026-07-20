import 'dotenv/config';
import { MongoClient } from 'mongodb';

const rawArgs = process.argv.slice(2);
const title = rawArgs[0] || 'Visual Culture, Digital Narrative';
const MONGO_URI = rawArgs[1] || process.env.MONGO_URI;
const DB_NAME = rawArgs[2] || process.env.DB_NAME || 'research';
const dryRun = rawArgs.includes('--dry-run');

const helpFlags = ['--help', '-h', 'help'];
if (rawArgs.some((arg) => helpFlags.includes(arg))) {
  console.log('Usage: node delete-duplicate-projects.mjs "Title Here" [mongodbUri] [dbName] [--dry-run]');
  console.log('Example:');
  console.log('  node delete-duplicate-projects.mjs "Visual Culture, Digital Narrative"');
  console.log('  node delete-duplicate-projects.mjs "Visual Culture, Digital Narrative" "mongodb://user:pass@host:port/db" research');
  console.log('  node delete-duplicate-projects.mjs "Visual Culture, Digital Narrative" "mongodb://user:pass@host:port/db" research --dry-run');
  process.exit(0);
}

if (!MONGO_URI) {
  console.error('Missing MongoDB URI. Provide it as the second argument or set MONGO_URI in backend/.env.');
  console.error('Usage: node delete-duplicate-projects.mjs "Title Here" [mongodbUri] [dbName] [--dry-run]');
  process.exit(1);
}

console.log(`Using MongoDB URI: ${MONGO_URI.startsWith('mongodb+srv://') ? '[mongodb+srv URI]' : MONGO_URI}`);
console.log(`Using database: ${DB_NAME}`);
console.log(`Target title: "${title}"`);
console.log(dryRun ? 'Running in dry-run mode; no deletions will be performed.' : 'Running in delete mode.');

const client = new MongoClient(MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
});

try {
  await client.connect();
  const db = client.db(DB_NAME);
  const projects = db.collection('projects');

  console.log(`Searching for duplicate published projects with title: "${title}"`);
  const matches = await projects
    .find({ title, status: 'published' })
    .sort({ createdAt: -1, _id: -1 })
    .project({ title: 1, slug: 1, status: 1, createdAt: 1 })
    .toArray();

  if (matches.length <= 1) {
    console.log(`Found ${matches.length} project(s). No duplicates to delete.`);
    process.exit(0);
  }

  const [keep, ...duplicates] = matches;
  const duplicateIds = duplicates.map((doc) => doc._id);

  console.log('Keeping one project:');
  console.log(JSON.stringify(keep, null, 2));
  console.log(`Found ${duplicates.length} duplicate project(s):`);
  duplicates.forEach((doc) => console.log(JSON.stringify(doc, null, 2)));

  if (dryRun) {
    console.log(`Dry run complete. ${duplicateIds.length} duplicate project(s) would be deleted.`);
    process.exit(0);
  }

  const result = await projects.deleteMany({ _id: { $in: duplicateIds } });
  console.log(`Deleted ${result.deletedCount || 0} duplicate project(s).`);
} catch (error) {
  console.error('Failed to delete duplicate projects:', error);
  if (error?.code === 'ECONNREFUSED' && MONGO_URI.startsWith('mongodb+srv://')) {
    console.error('MongoDB SRV DNS lookup failed. If you are behind a restricted network or DNS filter, use a direct mongodb:// URI instead of mongodb+srv://.');
    console.error('Example: node delete-duplicate-projects.mjs "Visual Culture, Digital Narrative" "mongodb://username:password@host1:27017,host2:27017/dbName" research');
  }
  process.exit(1);
} finally {
  await client.close();
}
