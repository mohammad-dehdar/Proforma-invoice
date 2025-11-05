#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { MongoClient, ServerApiVersion } = require('mongodb');
const { randomBytes, scryptSync } = require('crypto');

const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
};

const getMongoUri = () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }
  return uri;
};

const getCredentials = () => {
  const [, , usernameArg, passwordArg] = process.argv;
  const username = usernameArg || process.env.ADMIN_USERNAME;
  const password = passwordArg || process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error('Usage: npm run seed-user -- <username> <password>');
  }

  return { username, password };
};

(async () => {
  const uri = getMongoUri();
  const { username, password } = getCredentials();
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'proforma-invoice');
    const users = db.collection('users');

    const hashedPassword = hashPassword(password);
    const now = new Date();

    const existing = await users.findOne({ username });

    if (existing) {
      await users.updateOne(
        { _id: existing._id },
        {
          $set: {
            password: hashedPassword,
            updatedAt: now,
          },
        }
      );
      console.log(`✅ Password updated for user "${username}"`);
    } else {
      await users.insertOne({
        username,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`✅ User "${username}" created successfully`);
    }
  } catch (error) {
    console.error('❌ Failed to seed user:', error.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
})();
