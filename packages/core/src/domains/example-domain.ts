import type {
  CriarProdutoInput,
  ProdutoData,
} from "../contracts/example-domain";

export class Produto {
  readonly id: number;
  readonly nome: string;
  readonly descricao: string;
  readonly imagemUrl: string | null;
  private _preco: number;
  private _estoque: number;
  private _ativo: boolean;

  private constructor(data: ProdutoData) {
    this.id = data.id;
    this.nome = data.nome;
    this.descricao = data.descricao;
    this.imagemUrl = data.imagemUrl;
    this._preco = data.preco;
    this._estoque = data.estoque;
    this._ativo = data.ativo;
  }

  static criar(input: CriarProdutoInput): Produto | null {
    if (input.preco <= 0) {
      return null;
    }

    return new Produto({
      id: 0,
      nome: input.nome,
      descricao: input.descricao,
      preco: input.preco,
      estoque: 0,
      ativo: true,
      imagemUrl: input.imagemUrl,
    });
  }

  static restaurar(data: ProdutoData): Produto {
    return new Produto(data);
  }

  get preco(): number {
    return this._preco;
  }

  get estoque(): number {
    return this._estoque;
  }

  get ativo(): boolean {
    return this._ativo;
  }

  get disponivel(): boolean {
    return this._ativo && this._estoque > 0;
  }

  adicionarEstoque(quantidade: number): boolean {
    if (quantidade <= 0) {
      return false;
    }
    this._estoque += quantidade;
    return true;
  }

  removerEstoque(quantidade: number): boolean {
    if (quantidade <= 0) {
      return false;
    }
    if (this._estoque < quantidade) {
      return false;
    }
    this._estoque -= quantidade;
    return true;
  }

  alterarPreco(novoPreco: number): boolean {
    if (novoPreco <= 0) {
      return false;
    }
    this._preco = novoPreco;
    return true;
  }

  ativar(): boolean {
    if (this._estoque <= 0) {
      return false;
    }
    this._ativo = true;
    return true;
  }

  desativar(): void {
    this._ativo = false;
  }

  exportar(): ProdutoData {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      preco: this._preco,
      estoque: this._estoque,
      ativo: this._ativo,
      imagemUrl: this.imagemUrl,
    };
  }
}
