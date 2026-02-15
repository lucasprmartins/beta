import dotenv from "dotenv";
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { reset, seed } from "drizzle-seed";
import postgres from "postgres";

// Importe seus schemas aqui:
// import { exemplo } from "./schema/exemplo";

dotenv.config({
  path: "../../apps/server/.env",
});

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL não definida.");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { prepare: false });
const db = drizzle(client);

const schema = {
  // Adicione suas tabelas aqui:
  // exemplo,
};

async function main() {
  await reset(db, schema);
  await seed(db, schema);

  // Para customizar os dados gerados, use .refine():
  // await seed(db, schema).refine((f) => ({
  //   exemplo: {
  //     count: 20,
  //     columns: {
  //       nome: f.fullName(),
  //       email: f.email(),
  //     },
  //   },
  // }));

  console.log("Seed concluído!");
  await client.end();
}

main().catch((err) => {
  console.error("Seed falhou:", err);
  process.exit(1);
});
