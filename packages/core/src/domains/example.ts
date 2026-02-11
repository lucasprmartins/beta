import type { PokemonData } from "../contracts/example";

export class Pokemon {
  readonly id: number;
  readonly nome: string;
  readonly tipos: string[];
  private _nivel: number;
  private _hp: number;
  readonly sprite: string;

  private constructor(data: PokemonData) {
    this.id = data.id;
    this.nome = data.nome;
    this.tipos = [...data.tipos];
    this._nivel = data.nivel;
    this._hp = data.hp;
    this.sprite = data.sprite;
  }

  static criar(data: PokemonData): Pokemon | null {
    if (data.nivel < 1) {
      return null;
    }

    return new Pokemon(data);
  }

  get nivel(): number {
    return this._nivel;
  }

  get hp(): number {
    return this._hp;
  }

  treinar(): void {
    this._nivel += 1;
    this._hp += 5;
  }

  paraDados(): PokemonData {
    return {
      id: this.id,
      nome: this.nome,
      tipos: [...this.tipos],
      nivel: this._nivel,
      hp: this._hp,
      sprite: this.sprite,
    };
  }
}
