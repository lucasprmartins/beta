import type {
  CategoriaData,
  CategoriaRepository,
} from "@app/core/contracts/example-crud";
import { eq } from "drizzle-orm";
import { db } from "../index";
import { categoria } from "../schema/example-crud";

function exportar(row: typeof categoria.$inferSelect): CategoriaData {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
  };
}

export const dbCategoriaRepository: CategoriaRepository = {
  async buscarPorId(id) {
    const [row] = await db
      .select()
      .from(categoria)
      .where(eq(categoria.id, id))
      .limit(1);

    return row ? exportar(row) : null;
  },

  async listar({ cursor, limite }) {
    const rows = await db
      .select()
      .from(categoria)
      .limit(limite + 1)
      .offset(cursor);

    const temMais = rows.length > limite;
    const itens = (temMais ? rows.slice(0, limite) : rows).map(exportar);

    return {
      itens,
      proximoCursor: temMais ? cursor + limite : null,
    };
  },

  async criar(data) {
    const [row] = await db
      .insert(categoria)
      .values({
        nome: data.nome,
        descricao: data.descricao,
      })
      .returning();

    return row ? exportar(row) : null;
  },

  async atualizar(id, data) {
    const [row] = await db
      .update(categoria)
      .set(data)
      .where(eq(categoria.id, id))
      .returning();

    return row ? exportar(row) : null;
  },

  async deletar(id) {
    const result = await db
      .delete(categoria)
      .where(eq(categoria.id, id))
      .returning();

    return result.length > 0;
  },
};
