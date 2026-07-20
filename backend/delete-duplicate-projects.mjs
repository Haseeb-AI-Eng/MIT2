import 'dotenv/config';
import { MongoClient } from 'mongodb';

const rawArgs = process.argv.slice(2);
const title = rawArgs[0] || 'Visual Culture, Digital Narrative';
const MONGO_URI = rawArgs[1] || process.env.MONGO_URI;
const DB_NAME = rawArgs[2] || process.env.DB_NAME || 'research';
const dryRun = rawArgs.includes('--dry-run');

if (rawArgs.includes('--help') || rawArgs.includes('-h')) {
  console.log('Usage: node delete-duplicate-projects.mjs "Title Here" [mongodbUri] [dbName] [--dry-run]');
  console.log('Examples:');
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

const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 10000 });

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

  console.log(`Keeping one project:`);
  console.log(JSON.stringify(keep, null, 2));
  console.log(`Deleting ${duplicateIds.length} duplicate project(s):`);
  duplicates.forEach((doc) => console.log(JSON.stringify(doc, null, 2)));

  const result = await projects.deleteMany({ _id: { $in: duplicateIds } });
  console.log(`Deleted ${result.deletedCount || 0} duplicate project(s).`);
} catch (error) {
  console.error('Failed to delete duplicate projects:', error);
  process.exit(1);
} finally {
  await client.close();
}
