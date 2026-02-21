import type {
  ProdutoData,
  ProdutoRepository,
} from "@app/core/contracts/example-domain";
import { eq } from "drizzle-orm";
import { db } from "../index";
import { produto } from "../schema/example-domain";

function exportar(row: typeof produto.$inferSelect): ProdutoData {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    preco: Number(row.preco),
    estoque: row.estoque,
    ativo: row.ativo,
    imagemKey: row.imagemKey,
  };
}

export const produtoRepository: ProdutoRepository = {
  async buscarPorId(id) {
    const [row] = await db
      .select()
      .from(produto)
      .where(eq(produto.id, id))
      .limit(1);

    return row ? exportar(row) : null;
  },

  async listar({ cursor, limite }) {
    const rows = await db
      .select()
      .from(produto)
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
      .insert(produto)
      .values({
        nome: data.nome,
        descricao: data.descricao,
        preco: String(data.preco),
        estoque: data.estoque,
        ativo: data.ativo,
        imagemKey: data.imagemKey,
      })
      .returning();

    return row ? exportar(row) : null;
  },

  async atualizar(id, data) {
    const [row] = await db
      .update(produto)
      .set({
        nome: data.nome,
        descricao: data.descricao,
        preco: String(data.preco),
        estoque: data.estoque,
        ativo: data.ativo,
        imagemKey: data.imagemKey,
      })
      .where(eq(produto.id, id))
      .returning();

    return row ? exportar(row) : null;
  },
};
