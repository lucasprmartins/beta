import type { EntradaPaginacao, SaidaPaginacao } from "./paginacao";

export interface ProdutoData {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagemUrl: string | null;
}

export interface ProdutoRepository {
  buscarPorId(id: number): Promise<ProdutoData | null>;
  buscarPorNome(nome: string): Promise<ProdutoData | null>;
  buscarTodos(): Promise<ProdutoData[]>;
  listar(paginacao: EntradaPaginacao): Promise<SaidaPaginacao<ProdutoData>>;
  criar(data: ProdutoData): Promise<ProdutoData | null>;
  atualizar(id: number, data: ProdutoData): Promise<ProdutoData | null>;
  deletar(id: number): Promise<boolean>;
  criarSeNaoExiste(data: ProdutoData): Promise<ProdutoData | null>;
  buscarEAtualizar(
    id: number,
    transformar: (dados: ProdutoData) => ProdutoData | null
  ): Promise<ProdutoData | null>;
}
