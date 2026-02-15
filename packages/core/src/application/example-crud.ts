import type {
  CategoriaData,
  CategoriaRepository,
} from "../contracts/example-crud";

export function criarCategoria(repo: CategoriaRepository) {
  return async (
    data: Omit<CategoriaData, "id">
  ): Promise<CategoriaData | null> => {
    return await repo.criar(data);
  };
}

export function atualizarCategoria(repo: CategoriaRepository) {
  return async (
    id: number,
    data: Partial<Omit<CategoriaData, "id">>
  ): Promise<CategoriaData | null> => {
    return await repo.atualizar(id, data);
  };
}

export function deletarCategoria(repo: CategoriaRepository) {
  return async (id: number): Promise<boolean> => {
    return await repo.deletar(id);
  };
}
