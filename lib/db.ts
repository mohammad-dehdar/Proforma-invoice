import { MongoClient, MongoClientOptions, ServerApiVersion, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'proforma';

if (!uri) {
  throw new Error('MONGODB_URI environment variable is not set');
}

let clientPromise: Promise<MongoClient> | null = null;

const options: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

export const getMongoClient = async (): Promise<MongoClient> => {
  if (!clientPromise) {
    const client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
  return clientPromise;
};

export const getDb = async (): Promise<Db> => {
  const client = await getMongoClient();
  return client.db(dbName);
};
