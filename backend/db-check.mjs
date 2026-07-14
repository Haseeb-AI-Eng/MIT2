import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || 'default';
if (!uri) {
  console.error('MONGO_URI is not set');
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);
const formSubmissions = db.collection('form_submissions');
const projectMembers = db.collection('project_members');

console.log('DB:', db.databaseName);

const confirmed = await formSubmissions.find({ leadRequestStatus: 'confirmed' }).sort({ updatedAt: -1 }).limit(20).project({ name:1, email:1, projectId:1, projectSlug:1, projectTitle:1, leadRequestStatus:1, assignedAt:1, updatedAt:1 }).toArray();
console.log('Confirmed form_submissions (latest 20):');
console.log(JSON.stringify(confirmed, null, 2));

const projectIds = [...new Set(confirmed.filter(doc => doc.projectId).map(doc => doc.projectId.toString()))];
if (projectIds.length) {
  console.log('Project IDs from confirmed submissions:', projectIds);
  for (const pid of projectIds) {
    try {
      const members = await projectMembers.find({ projectId: new ObjectId(pid) }).project({ userId:1, role:1, createdAt:1, isNew:1 }).toArray();
      console.log(`Members for projectId ${pid}:`);
      console.log(JSON.stringify(members, null, 2));
    } catch (err) {
      console.error('Error querying project_members for', pid, err.message);
    }
  }
} else {
  console.log('No confirmed submissions with projectId found.');
}

await client.close();
