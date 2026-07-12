import { MongoClient, type Db } from "mongodb";
import { logger } from "./logger";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI environment variable is required");
}

const client = new MongoClient(uri);
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;
  await client.connect();
  db = client.db();
  logger.info("Connected to MongoDB");
  return db;
}

export async function closeDb(): Promise<void> {
  await client.close();
  db = null;
}
