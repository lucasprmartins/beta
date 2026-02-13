import type { ProdutoData } from "../contracts/example";

export class Produto {
  readonly id: number;
  readonly nome: string;
  readonly descricao: string;
  readonly imagemUrl: string | null;
  private readonly _preco: number;
  private _estoque: number;

  private constructor(data: ProdutoData) {
    this.id = data.id;
    this.nome = data.nome;
    this.descricao = data.descricao;
    this.imagemUrl = data.imagemUrl;
    this._preco = data.preco;
    this._estoque = data.estoque;
  }

  static criar(data: ProdutoData): Produto | null {
    if (data.preco <= 0) {
      return null;
    }

    return new Produto(data);
  }

  get preco(): number {
    return this._preco;
  }

  get estoque(): number {
    return this._estoque;
  }

  adicionarEstoque(quantidade: number): void {
    this._estoque += quantidade;
  }

  paraDados(): ProdutoData {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      preco: this._preco,
      estoque: this._estoque,
      imagemUrl: this.imagemUrl,
    };
  }
}
