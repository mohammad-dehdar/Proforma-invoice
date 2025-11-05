import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('متغیر محیطی MONGODB_URI تنظیم نشده است. لطفاً آن را در فایل env. قرار دهید.');
}

const dbName = process.env.MONGODB_DB || 'proforma_invoice';

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

let cachedClientPromise: Promise<MongoClient> | undefined = global.__mongoClientPromise;

if (!cachedClientPromise) {
  const client = new MongoClient(uri);
  cachedClientPromise = client.connect();
  global.__mongoClientPromise = cachedClientPromise;
}

export async function getMongoClient(): Promise<MongoClient> {
  return cachedClientPromise as Promise<MongoClient>;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}
