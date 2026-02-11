import type { PokemonData, PokemonRepository } from "../contracts/example";
import { Pokemon } from "../domains/example";

export function criarPokemon(repo: PokemonRepository) {
  return async (data: PokemonData): Promise<PokemonData | null> => {
    const existente = await repo.buscarPorNome(data.nome);

    if (existente) {
      return null;
    }

    const pokemon = Pokemon.criar(data);

    if (!pokemon) {
      return null;
    }

    return repo.criar(pokemon.paraDados());
  };
}

export function treinarPokemon(repo: PokemonRepository) {
  return async (id: number): Promise<PokemonData | null> => {
    const dados = await repo.buscarPorId(id);

    if (!dados) {
      return null;
    }

    const pokemon = Pokemon.criar(dados);

    if (!pokemon) {
      return null;
    }

    pokemon.treinar();

    return repo.atualizar(id, pokemon.paraDados());
  };
}
