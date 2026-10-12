import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

let sqlClient: ReturnType<typeof neon> | null = null;
let dbClient: NeonHttpDatabase<typeof schema> | null = null;

if (databaseUrl) {
  try {
    sqlClient = neon(databaseUrl);
    dbClient = drizzle(sqlClient, { schema });
  } catch (err) {
    console.warn("Database connection could not be established:", err);
  }
}

export const sql = sqlClient;
export const db = dbClient as unknown as NeonHttpDatabase<typeof schema>;

export type DB = NeonHttpDatabase<typeof schema>;
export * from "./schema";

