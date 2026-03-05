import dotenv from "dotenv";
import "dotenv/config";

dotenv.config({
  path: "../../apps/server/.env",
});

import { reset, seed } from "drizzle-seed";
import { logger } from "../logger";
import { db } from "./index";
import { categoria } from "./schema/example-crud";
import { produto } from "./schema/example-domain";

const schema = { categoria, produto };

async function main() {
  await reset(db, schema);
  await seed(db, schema, { count: 20 });

  // Para personalizar os dados gerados, substitua o seed acima por .refine():
  //
  // await seed(db, schema).refine((f) => ({
  //   categoria: {
  //     count: 5,
  //     columns: {
  //       nome: f.valuesFromArray(["Eletrônicos", "Roupas", "Alimentos"]),
  //       descricao: f.loremIpsum({ sentencesCount: 1 }),
  //     },
  //   },
  //   produto: {
  //     count: 20,
  //     columns: {
  //       nome: f.fullName(),
  //       preco: f.number({ minValue: 9.9, maxValue: 999.99, precision: 100 }),
  //       estoque: f.int({ minValue: 0, maxValue: 200 }),
  //     },
  //   },
  // }));

  logger.info("Seed concluído!");
}

main().catch((err) => {
  logger.error({ err }, "Seed falhou");
  process.exit(1);
});
