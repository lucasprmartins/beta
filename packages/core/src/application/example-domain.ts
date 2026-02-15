import type {
  CriarProdutoInput,
  ProdutoData,
  ProdutoRepository,
} from "../contracts/example-domain";
import { Produto } from "../domains/example-domain";

export function criarProduto(repo: ProdutoRepository) {
  return async (input: CriarProdutoInput): Promise<ProdutoData | null> => {
    const produto = Produto.criar(input);
    if (!produto) {
      return null;
    }
    return await repo.criar(produto.exportar());
  };
}

export function adicionarEstoqueProduto(repo: ProdutoRepository) {
  return async (
    id: number,
    quantidade: number
  ): Promise<ProdutoData | null> => {
    const dados = await repo.buscarPorId(id);
    if (!dados) {
      return null;
    }

    const produto = Produto.restaurar(dados);
    if (!produto.adicionarEstoque(quantidade)) {
      return null;
    }

    return await repo.atualizar(id, produto.exportar());
  };
}

export function removerEstoqueProduto(repo: ProdutoRepository) {
  return async (
    id: number,
    quantidade: number
  ): Promise<ProdutoData | null> => {
    const dados = await repo.buscarPorId(id);
    if (!dados) {
      return null;
    }

    const produto = Produto.restaurar(dados);
    if (!produto.removerEstoque(quantidade)) {
      return null;
    }

    return await repo.atualizar(id, produto.exportar());
  };
}

export function alterarPrecoProduto(repo: ProdutoRepository) {
  return async (id: number, novoPreco: number): Promise<ProdutoData | null> => {
    const dados = await repo.buscarPorId(id);
    if (!dados) {
      return null;
    }

    const produto = Produto.restaurar(dados);
    if (!produto.alterarPreco(novoPreco)) {
      return null;
    }

    return await repo.atualizar(id, produto.exportar());
  };
}

export function ativarProduto(repo: ProdutoRepository) {
  return async (id: number): Promise<ProdutoData | null> => {
    const dados = await repo.buscarPorId(id);
    if (!dados) {
      return null;
    }

    const produto = Produto.restaurar(dados);
    if (!produto.ativar()) {
      return null;
    }

    return await repo.atualizar(id, produto.exportar());
  };
}

export function desativarProduto(repo: ProdutoRepository) {
  return async (id: number): Promise<ProdutoData | null> => {
    const dados = await repo.buscarPorId(id);
    if (!dados) {
      return null;
    }

    const produto = Produto.restaurar(dados);
    produto.desativar();

    return await repo.atualizar(id, produto.exportar());
  };
}
