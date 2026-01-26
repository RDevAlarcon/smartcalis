import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL no está configurado");
}

const client = postgres(databaseUrl, { max: 10 });

export const db = drizzle(client);
export type DbClient = typeof db;
