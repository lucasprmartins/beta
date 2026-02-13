export interface EntradaPaginacao {
  cursor: number;
  limite: number;
}

export interface SaidaPaginacao<T> {
  itens: T[];
  proximoCursor: number | null;
}
