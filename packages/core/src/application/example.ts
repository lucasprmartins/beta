import type { PokemonData, PokemonRepository } from "../contracts/example";
import { Pokemon } from "../domains/example";

export function criarPokemon(repo: PokemonRepository) {
  return async (data: PokemonData): Promise<PokemonData | null> => {
    const pokemon = Pokemon.criar(data);
    if (!pokemon) {
      return null;
    }
    return await repo.criarSeNaoExiste(pokemon.paraDados());
  };
}

export function treinarPokemon(repo: PokemonRepository) {
  return async (id: number): Promise<PokemonData | null> => {
    return await repo.buscarEAtualizar(id, (dados) => {
      const pokemon = Pokemon.criar(dados);
      if (!pokemon) {
        return null;
      }
      pokemon.treinar();
      return pokemon.paraDados();
    });
  };
}
