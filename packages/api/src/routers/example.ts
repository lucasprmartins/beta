import { criarPokemon, treinarPokemon } from "@app/core/application/example";
import { dbPokemonRepository } from "@app/infra/db/repositories/example";
import { z } from "zod";
import { publicRouter } from "../auth";

const criar = criarPokemon(dbPokemonRepository);
const treinar = treinarPokemon(dbPokemonRepository);

const pokemonSchema = z.object({
  id: z.number().int().min(1).describe("ID da National Dex"),
  nome: z.string().min(1).describe("Nome do Pokemon"),
  tipos: z.array(z.string()).min(1).describe("Tipos do Pokemon"),
  nivel: z.number().int().min(1).describe("Nível atual"),
  hp: z.number().int().min(1).describe("Pontos de vida"),
  sprite: z.url().describe("URL do sprite"),
});

export const pokemonRouter = {
  buscar: publicRouter
    .route({
      method: "GET",
      path: "/pokemon/buscar",
      summary: "Buscar Pokemon",
      description: "Busca um Pokemon pelo ID da National Dex.",
      tags: ["Pokemon"],
    })
    .input(
      z.object({
        id: z
          .string()
          .min(1, "ID é obrigatório")
          .transform((val) => Number.parseInt(val, 10))
          .refine(
            (val) => !Number.isNaN(val) && val >= 1,
            "ID deve ser um número válido maior que 0"
          )
          .describe("ID da National Dex"),
      })
    )
    .output(pokemonSchema)
    .errors({
      NOT_FOUND: {
        message: "Pokemon não encontrado",
        data: z.object({
          id: z.number().describe("ID que foi buscado"),
        }),
      },
    })
    .handler(async ({ input, errors }) => {
      const pokemon = await dbPokemonRepository.buscarPorId(input.id);

      if (!pokemon) {
        throw errors.NOT_FOUND({ data: { id: input.id } });
      }

      return pokemon;
    }),

  criar: publicRouter
    .route({
      method: "POST",
      path: "/pokemon/criar",
      summary: "Criar Pokemon",
      description: "Cria um novo Pokemon no sistema.",
      tags: ["Pokemon"],
    })
    .input(pokemonSchema)
    .output(pokemonSchema)
    .errors({
      CONFLICT: {
        message: "Pokemon já existe",
        data: z.object({
          nome: z.string().describe("Nome duplicado"),
        }),
      },
    })
    .handler(async ({ input, errors }) => {
      const pokemon = await criar(input);

      if (!pokemon) {
        throw errors.CONFLICT({ data: { nome: input.nome } });
      }

      return pokemon;
    }),

  treinar: publicRouter
    .route({
      method: "POST",
      path: "/pokemon/treinar",
      summary: "Treinar Pokemon",
      description: "Treina um Pokemon, aumentando nível em 1 e HP em 5.",
      tags: ["Pokemon"],
    })
    .input(
      z.object({
        id: z.number().int().min(1).describe("ID da National Dex"),
      })
    )
    .output(pokemonSchema)
    .errors({
      NOT_FOUND: {
        message: "Pokemon não encontrado",
        data: z.object({
          id: z.number().describe("ID que foi buscado"),
        }),
      },
    })
    .handler(async ({ input, errors }) => {
      const pokemon = await treinar(input.id);

      if (!pokemon) {
        throw errors.NOT_FOUND({ data: { id: input.id } });
      }

      return pokemon;
    }),

  listar: publicRouter
    .route({
      method: "GET",
      path: "/pokemon/listar",
      summary: "Listar Pokemons",
      description: "Lista todos os Pokemons cadastrados.",
      tags: ["Pokemon"],
    })
    .output(z.array(pokemonSchema))
    .handler(async () => dbPokemonRepository.buscarTodos()),
};
