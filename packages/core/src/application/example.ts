import type { ProdutoData, ProdutoRepository } from "../contracts/example";
import { Produto } from "../domains/example";

export function criarProduto(repo: ProdutoRepository) {
  return async (data: ProdutoData): Promise<ProdutoData | null> => {
    const produto = Produto.criar(data);
    if (!produto) {
      return null;
    }
    return await repo.criarSeNaoExiste(produto.paraDados());
  };
}

export function adicionarEstoqueProduto(repo: ProdutoRepository) {
  return async (
    id: number,
    quantidade: number
  ): Promise<ProdutoData | null> => {
    return await repo.buscarEAtualizar(id, (dados) => {
      const produto = Produto.criar(dados);
      if (!produto) {
        return null;
      }
      produto.adicionarEstoque(quantidade);
      return produto.paraDados();
    });
  };
}
