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
  criar(data: PokemonData): Promise<PokemonData | null>;
  atualizar(id: number, data: PokemonData): Promise<PokemonData | null>;
  deletar(id: number): Promise<boolean>;
}
