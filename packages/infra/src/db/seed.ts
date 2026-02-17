import dotenv from "dotenv";
import "dotenv/config";

dotenv.config({
  path: "../../apps/server/.env",
});

import { reset, seed } from "drizzle-seed";
import { logger } from "../logger";
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

  logger.info("Seed concluído!");
}

main().catch((err) => {
  logger.error({ err }, "Seed falhou");
  process.exit(1);
});
