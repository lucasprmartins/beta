import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const dbUrl = process.env.DATABASE_URL as string;
const client = postgres(dbUrl, { prepare: false });
export const db = drizzle(client);
