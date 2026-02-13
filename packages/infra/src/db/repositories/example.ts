import type {
  PokemonData,
  PokemonRepository,
} from "@app/core/contracts/example";
import { eq } from "drizzle-orm";
import { db } from "../index";
import { pokemon } from "../schema/example";

function paraDados(row: typeof pokemon.$inferSelect): PokemonData {
  return {
    id: row.id,
    nome: row.nome,
    tipos: row.tipos,
    nivel: row.nivel,
    hp: row.hp,
    sprite: row.sprite,
  };
}

export const dbPokemonRepository: PokemonRepository = {
  async buscarPorId(id) {
    const [row] = await db
      .select()
      .from(pokemon)
      .where(eq(pokemon.id, id))
      .limit(1);

    return row ? paraDados(row) : null;
  },

  async buscarPorNome(nome) {
    const [row] = await db
      .select()
      .from(pokemon)
      .where(eq(pokemon.nome, nome))
      .limit(1);

    return row ? paraDados(row) : null;
  },

  async buscarTodos() {
    const rows = await db.select().from(pokemon);
    return rows.map(paraDados);
  },

  async criar(data) {
    const [row] = await db
      .insert(pokemon)
      .values({
        id: data.id,
        nome: data.nome,
        tipos: data.tipos,
        nivel: data.nivel,
        hp: data.hp,
        sprite: data.sprite,
      })
      .returning();

    return row ? paraDados(row) : null;
  },

  async atualizar(id, data) {
    const [row] = await db
      .update(pokemon)
      .set({
        nome: data.nome,
        tipos: data.tipos,
        nivel: data.nivel,
        hp: data.hp,
        sprite: data.sprite,
      })
      .where(eq(pokemon.id, id))
      .returning();

    return row ? paraDados(row) : null;
  },

  async deletar(id) {
    const result = await db
      .delete(pokemon)
      .where(eq(pokemon.id, id))
      .returning();

    return result.length > 0;
  },

  async criarSeNaoExiste(data) {
    return await db.transaction(async (tx) => {
      const [existente] = await tx
        .select()
        .from(pokemon)
        .where(eq(pokemon.nome, data.nome))
        .limit(1);

      if (existente) {
        return null;
      }

      const [row] = await tx
        .insert(pokemon)
        .values({
          id: data.id,
          nome: data.nome,
          tipos: data.tipos,
          nivel: data.nivel,
          hp: data.hp,
          sprite: data.sprite,
        })
        .returning();

      return row ? paraDados(row) : null;
    });
  },

  async buscarEAtualizar(id, transformar) {
    return await db.transaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(pokemon)
        .where(eq(pokemon.id, id))
        .limit(1);

      if (!row) {
        return null;
      }

      const resultado = transformar(paraDados(row));
      if (!resultado) {
        return null;
      }

      const [atualizado] = await tx
        .update(pokemon)
        .set({
          nome: resultado.nome,
          tipos: resultado.tipos,
          nivel: resultado.nivel,
          hp: resultado.hp,
          sprite: resultado.sprite,
        })
        .where(eq(pokemon.id, id))
        .returning();

      return atualizado ? paraDados(atualizado) : null;
    });
  },
};
