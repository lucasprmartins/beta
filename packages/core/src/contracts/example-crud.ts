import type { EntradaPaginacao, SaidaPaginacao } from "./paginacao";

export interface CategoriaData {
  id: number;
  nome: string;
  descricao: string;
}

export interface CategoriaRepository {
  buscarPorId(id: number): Promise<CategoriaData | null>;
  listar(paginacao: EntradaPaginacao): Promise<SaidaPaginacao<CategoriaData>>;
  criar(data: Omit<CategoriaData, "id">): Promise<CategoriaData | null>;
  atualizar(
    id: number,
    data: Partial<Omit<CategoriaData, "id">>
  ): Promise<CategoriaData | null>;
  deletar(id: number): Promise<boolean>;
}
