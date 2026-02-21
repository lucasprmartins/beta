import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const produto = pgTable("produto", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull().unique(),
  descricao: text("descricao").notNull(),
  preco: numeric("preco", { precision: 10, scale: 2 }).notNull(),
  estoque: integer("estoque").notNull().default(0),
  ativo: boolean("ativo").notNull().default(true),
  imagemKey: text("imagem_key"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}).enableRLS();
