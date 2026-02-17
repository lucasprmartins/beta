import dotenv from "dotenv";
import "dotenv/config";

dotenv.config({
  path: "../../apps/server/.env",
});

import { reset, seed } from "drizzle-seed";
import { db } from "./index";

// Importe seus schemas aqui:
// import { exemplo } from "./schema/exemplo";

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
}

main().catch((err) => {
  console.error("Seed falhou:", err);
  process.exit(1);
});
