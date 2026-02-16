import dotenv from "dotenv";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

dotenv.config({
  path: "../../apps/server/.env",
});

export default defineConfig({
  out: "./src/db/migrations",
  dialect: "postgresql",
  schema: "./src/db/schema",

  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },

  schemaFilter: ["public", "auth"],

  migrations: {
    prefix: "index",
    table: "migrations",
    schema: "drizzle",
  },

  breakpoints: true,
  strict: true,
});
