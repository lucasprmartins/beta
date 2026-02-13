import type {
  ProdutoData,
  ProdutoRepository,
} from "@app/core/contracts/example";
import { eq } from "drizzle-orm";
import { db } from "../index";
import { produto } from "../schema/example";

function paraDados(row: typeof produto.$inferSelect): ProdutoData {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    preco: row.preco,
    estoque: row.estoque,
    imagemUrl: row.imagemUrl,
  };
}

export const dbProdutoRepository: ProdutoRepository = {
  async buscarPorId(id) {
    const [row] = await db
      .select()
      .from(produto)
      .where(eq(produto.id, id))
      .limit(1);

    return row ? paraDados(row) : null;
  },

  async buscarPorNome(nome) {
    const [row] = await db
      .select()
      .from(produto)
      .where(eq(produto.nome, nome))
      .limit(1);

    return row ? paraDados(row) : null;
  },

  async buscarTodos() {
    const rows = await db.select().from(produto);
    return rows.map(paraDados);
  },

  async listar({ cursor, limite }) {
    const rows = await db
      .select()
      .from(produto)
      .limit(limite + 1)
      .offset(cursor);

    const temMais = rows.length > limite;
    const itens = (temMais ? rows.slice(0, limite) : rows).map(paraDados);

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
        preco: data.preco,
        estoque: data.estoque,
        imagemUrl: data.imagemUrl,
      })
      .returning();

    return row ? paraDados(row) : null;
  },

  async atualizar(id, data) {
    const [row] = await db
      .update(produto)
      .set({
        nome: data.nome,
        descricao: data.descricao,
        preco: data.preco,
        estoque: data.estoque,
        imagemUrl: data.imagemUrl,
      })
      .where(eq(produto.id, id))
      .returning();

    return row ? paraDados(row) : null;
  },

  async deletar(id) {
    const result = await db
      .delete(produto)
      .where(eq(produto.id, id))
      .returning();

    return result.length > 0;
  },

  async criarSeNaoExiste(data) {
    return await db.transaction(async (tx) => {
      const [existente] = await tx
        .select()
        .from(produto)
        .where(eq(produto.nome, data.nome))
        .limit(1);

      if (existente) {
        return null;
      }

      const [row] = await tx
        .insert(produto)
        .values({
          nome: data.nome,
          descricao: data.descricao,
          preco: data.preco,
          estoque: data.estoque,
          imagemUrl: data.imagemUrl,
        })
        .returning();

      return row ? paraDados(row) : null;
    });
  },

  async buscarEAtualizar(id, transformar) {
    return await db.transaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(produto)
        .where(eq(produto.id, id))
        .limit(1);

      if (!row) {
        return null;
      }

      const resultado = transformar(paraDados(row));
      if (!resultado) {
        return null;
      }

      const [atualizado] = await tx
        .update(produto)
        .set({
          nome: resultado.nome,
          descricao: resultado.descricao,
          preco: resultado.preco,
          estoque: resultado.estoque,
          imagemUrl: resultado.imagemUrl,
        })
        .where(eq(produto.id, id))
        .returning();

      return atualizado ? paraDados(atualizado) : null;
    });
  },
};
