import {
  atualizarCategoria,
  criarCategoria,
  deletarCategoria,
} from "@app/core/application/example-crud";
import { categoriaRepository } from "@app/infra/db/repositories/example-crud";
import { z } from "zod";
import { o } from "../auth";

const criar = criarCategoria(categoriaRepository);
const atualizar = atualizarCategoria(categoriaRepository);
const deletar = deletarCategoria(categoriaRepository);

const categoriaSchema = z.object({
  id: z.number().int().describe("ID da categoria"),
  nome: z.string().min(1).describe("Nome da categoria"),
  descricao: z.string().min(1).describe("Descricao da categoria"),
});

export const categoriaRouter = {
  buscar: o
    .route({
      method: "GET",
      path: "/categoria/buscar",
      summary: "Buscar Categoria",
      description: "Busca uma categoria pelo ID.",
      tags: ["Categoria"],
    })
    .input(
      z.object({
        id: z
          .string()
          .min(1, "ID e obrigatorio")
          .transform((val) => Number.parseInt(val, 10))
          .refine(
            (val) => !Number.isNaN(val) && val >= 1,
            "ID deve ser um numero valido maior que 0"
          )
          .describe("ID da categoria"),
      })
    )
    .output(categoriaSchema)
    .errors({
      NOT_FOUND: {
        message: "Categoria nao encontrada",
        data: z.object({ id: z.number() }),
      },
    })
    .handler(async ({ input, errors }) => {
      const resultado = await categoriaRepository.buscarPorId(input.id);

      if (!resultado) {
        throw errors.NOT_FOUND({ data: { id: input.id } });
      }

      return resultado;
    }),

  criar: o
    .route({
      method: "POST",
      path: "/categoria/criar",
      summary: "Criar Categoria",
      description: "Cria uma nova categoria.",
      tags: ["Categoria"],
    })
    .input(categoriaSchema.omit({ id: true }))
    .output(categoriaSchema)
    .errors({
      CONFLICT: {
        message: "Categoria ja existe",
        data: z.object({ nome: z.string() }),
      },
    })
    .handler(async ({ input, errors }) => {
      const resultado = await criar(input);

      if (!resultado) {
        throw errors.CONFLICT({ data: { nome: input.nome } });
      }

      return resultado;
    }),

  atualizar: o
    .route({
      method: "POST",
      path: "/categoria/atualizar",
      summary: "Atualizar Categoria",
      description: "Atualiza uma categoria existente.",
      tags: ["Categoria"],
    })
    .input(
      z.object({
        id: z.number().int().min(1).describe("ID da categoria"),
        nome: z.string().min(1).optional().describe("Nome"),
        descricao: z.string().min(1).optional().describe("Descricao"),
      })
    )
    .output(categoriaSchema)
    .errors({
      NOT_FOUND: {
        message: "Categoria nao encontrada",
        data: z.object({ id: z.number() }),
      },
    })
    .handler(async ({ input, errors }) => {
      const { id, ...dados } = input;
      const resultado = await atualizar(id, dados);

      if (!resultado) {
        throw errors.NOT_FOUND({ data: { id } });
      }

      return resultado;
    }),

  deletar: o
    .route({
      method: "POST",
      path: "/categoria/deletar",
      summary: "Deletar Categoria",
      description: "Deleta uma categoria.",
      tags: ["Categoria"],
    })
    .input(
      z.object({
        id: z.number().int().min(1).describe("ID da categoria"),
      })
    )
    .output(z.object({ sucesso: z.boolean() }))
    .errors({
      NOT_FOUND: {
        message: "Categoria nao encontrada",
        data: z.object({ id: z.number() }),
      },
    })
    .handler(async ({ input, errors }) => {
      const resultado = await deletar(input.id);

      if (!resultado) {
        throw errors.NOT_FOUND({ data: { id: input.id } });
      }

      return { sucesso: true };
    }),

  listar: o
    .route({
      method: "GET",
      path: "/categoria/listar",
      summary: "Listar Categorias",
      description: "Lista categorias com paginacao.",
      tags: ["Categoria"],
    })
    .input(
      z.object({
        cursor: z.coerce
          .number()
          .int()
          .min(0)
          .default(0)
          .describe("Offset para paginacao"),
        limite: z.coerce
          .number()
          .int()
          .min(1)
          .max(100)
          .default(10)
          .describe("Itens por pagina"),
      })
    )
    .output(
      z.object({
        itens: z.array(categoriaSchema),
        proximoCursor: z.number().nullable(),
      })
    )
    .handler(async ({ input }) => categoriaRepository.listar(input)),
};
