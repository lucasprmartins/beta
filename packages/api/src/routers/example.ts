import {
  adicionarEstoqueProduto,
  criarProduto,
} from "@app/core/application/example";
import { dbProdutoRepository } from "@app/infra/db/repositories/example";
import { z } from "zod";
import { o } from "../auth";

const criar = criarProduto(dbProdutoRepository);
const adicionarEstoque = adicionarEstoqueProduto(dbProdutoRepository);

const produtoSchema = z.object({
  id: z.number().int().describe("ID do produto"),
  nome: z.string().min(1).describe("Nome do produto"),
  descricao: z.string().min(1).describe("Descrição do produto"),
  preco: z.number().min(0.01).describe("Preço do produto"),
  estoque: z.number().int().min(0).describe("Quantidade em estoque"),
  imagemUrl: z.string().url().nullable().describe("URL da imagem do produto"),
});

export const produtoRouter = {
  buscar: o
    .route({
      method: "GET",
      path: "/produto/buscar",
      summary: "Buscar Produto",
      description: "Busca um produto pelo ID.",
      tags: ["Produto"],
    })
    .input(
      z.object({
        id: z
          .string()
          .min(1, "ID é obrigatório")
          .transform((val) => Number.parseInt(val, 10))
          .refine(
            (val) => !Number.isNaN(val) && val >= 1,
            "ID deve ser um número válido maior que 0"
          )
          .describe("ID do produto"),
      })
    )
    .output(produtoSchema)
    .errors({
      NOT_FOUND: {
        message: "Produto não encontrado",
        data: z.object({
          id: z.number().describe("ID que foi buscado"),
        }),
      },
    })
    .handler(async ({ input, errors }) => {
      const produto = await dbProdutoRepository.buscarPorId(input.id);

      if (!produto) {
        throw errors.NOT_FOUND({ data: { id: input.id } });
      }

      return produto;
    }),

  criar: o
    .route({
      method: "POST",
      path: "/produto/criar",
      summary: "Criar Produto",
      description: "Cria um novo produto no sistema.",
      tags: ["Produto"],
    })
    .input(produtoSchema)
    .output(produtoSchema)
    .errors({
      CONFLICT: {
        message: "Produto já existe",
        data: z.object({
          nome: z.string().describe("Nome duplicado"),
        }),
      },
    })
    .handler(async ({ input, errors }) => {
      const produto = await criar(input);

      if (!produto) {
        throw errors.CONFLICT({ data: { nome: input.nome } });
      }

      return produto;
    }),

  adicionarEstoque: o
    .route({
      method: "POST",
      path: "/produto/adicionar-estoque",
      summary: "Adicionar Estoque",
      description: "Adiciona quantidade ao estoque de um produto.",
      tags: ["Produto"],
    })
    .input(
      z.object({
        id: z.number().int().min(1).describe("ID do produto"),
        quantidade: z.number().int().min(1).describe("Quantidade a adicionar"),
      })
    )
    .output(produtoSchema)
    .errors({
      NOT_FOUND: {
        message: "Produto não encontrado",
        data: z.object({
          id: z.number().describe("ID que foi buscado"),
        }),
      },
    })
    .handler(async ({ input, errors }) => {
      const produto = await adicionarEstoque(input.id, input.quantidade);

      if (!produto) {
        throw errors.NOT_FOUND({ data: { id: input.id } });
      }

      return produto;
    }),

  listar: o
    .route({
      method: "GET",
      path: "/produto/listar",
      summary: "Listar Produtos",
      description: "Lista produtos com paginação cursor-based.",
      tags: ["Produto"],
    })
    .input(
      z.object({
        cursor: z.coerce
          .number()
          .int()
          .min(0)
          .default(0)
          .describe("Offset para paginação"),
        limite: z.coerce
          .number()
          .int()
          .min(1)
          .max(100)
          .default(10)
          .describe("Quantidade de itens por página"),
      })
    )
    .output(
      z.object({
        itens: z.array(produtoSchema),
        proximoCursor: z.number().nullable(),
      })
    )
    .handler(async ({ input }) => dbProdutoRepository.listar(input)),
};
