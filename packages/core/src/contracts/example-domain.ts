import type { EntradaPaginacao, SaidaPaginacao } from "./paginacao";

export interface CriarProdutoInput {
  nome: string;
  descricao: string;
  preco: number;
  imagemUrl: string | null;
}

export interface ProdutoData {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  ativo: boolean;
  imagemUrl: string | null;
}

export interface ProdutoRepository {
  buscarPorId(id: number): Promise<ProdutoData | null>;
  listar(paginacao: EntradaPaginacao): Promise<SaidaPaginacao<ProdutoData>>;
  criar(data: ProdutoData): Promise<ProdutoData | null>;
  atualizar(id: number, data: ProdutoData): Promise<ProdutoData | null>;
}
