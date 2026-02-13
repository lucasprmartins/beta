import type { EntradaPaginacao, SaidaPaginacao } from "./paginacao";

export interface PokemonData {
  id: number;
  nome: string;
  tipos: string[];
  nivel: number;
  hp: number;
  sprite: string;
}

export interface PokemonRepository {
  buscarPorId(id: number): Promise<PokemonData | null>;
  buscarPorNome(nome: string): Promise<PokemonData | null>;
  buscarTodos(): Promise<PokemonData[]>;
  listar(paginacao: EntradaPaginacao): Promise<SaidaPaginacao<PokemonData>>;
  criar(data: PokemonData): Promise<PokemonData | null>;
  atualizar(id: number, data: PokemonData): Promise<PokemonData | null>;
  deletar(id: number): Promise<boolean>;
  criarSeNaoExiste(data: PokemonData): Promise<PokemonData | null>;
  buscarEAtualizar(
    id: number,
    transformar: (dados: PokemonData) => PokemonData | null
  ): Promise<PokemonData | null>;
}
