import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const pokemon = pgTable("pokemon", {
  id: integer("id").primaryKey(),
  nome: text("nome").notNull().unique(),
  tipos: text("tipos").array().notNull(),
  nivel: integer("nivel").notNull().default(1),
  hp: integer("hp").notNull(),
  sprite: text("sprite").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}).enableRLS();
