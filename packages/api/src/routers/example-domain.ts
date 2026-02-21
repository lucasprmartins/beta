import {
  adicionarEstoqueProduto,
  alterarPrecoProduto,
  ativarProduto,
  criarProduto,
  desativarProduto,
  removerEstoqueProduto,
} from "@app/core/application/example-domain";
import type { ProdutoData } from "@app/core/contracts/example-domain";
import { produtoRepository } from "@app/infra/db/repositories/example-domain";
import {
  gerarUrlDownload,
  gerarUrlUpload,
} from "@app/infra/integrations/storage";
import { z } from "zod";
import { o } from "../auth";

async function exportarProduto(dados: ProdutoData) {
  const { imagemKey, ...resto } = dados;
  return {
    ...resto,
    imagemUrl: imagemKey ? await gerarUrlDownload(imagemKey, 900) : null,
  };
}

const criar = criarProduto(produtoRepository);
const adicionarEstoque = adicionarEstoqueProduto(produtoRepository);
const removerEstoque = removerEstoqueProduto(produtoRepository);
const alterarPreco = alterarPrecoProduto(produtoRepository);
const ativar = ativarProduto(produtoRepository);
const desativar = desativarProduto(produtoRepository);

const produtoSchema = z.object({
  id: z.number().int().describe("ID do produto"),
  nome: z.string().min(1).describe("Nome do produto"),
  descricao: z.string().min(1).describe("Descrição do produto"),
  preco: z.number().min(0.01).describe("Preço do produto"),
  estoque: z.number().int().min(0).describe("Quantidade em estoque"),
  ativo: z.boolean().describe("Se o produto está ativo"),
  imagemUrl: z.url().nullable().describe("URL da imagem do produto"),
});

const criarProdutoSchema = z.object({
  nome: z.string().min(1).describe("Nome do produto"),
  descricao: z.string().min(1).describe("Descrição do produto"),
  preco: z.number().min(0.01).describe("Preço do produto"),
  imagemKey: z.string().nullable().describe("Chave S3 da imagem do produto"),
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
        data: z.object({ id: z.number() }),
      },
    })
    .handler(async ({ input, errors }) => {
      const resultado = await produtoRepository.buscarPorId(input.id);

      if (!resultado) {
        throw errors.NOT_FOUND({ data: { id: input.id } });
      }

      return exportarProduto(resultado);
    }),

  criar: o
    .route({
      method: "POST",
      path: "/produto/criar",
      summary: "Criar Produto",
      description: "Cria um novo produto no sistema.",
      tags: ["Produto"],
    })
    .input(criarProdutoSchema)
    .output(produtoSchema)
    .errors({
      BAD_REQUEST: {
        message: "Dados inválidos",
        data: z.object({ motivo: z.string() }),
      },
    })
    .handler(async ({ input, errors }) => {
      const resultado = await criar(input);

      if (!resultado) {
        throw errors.BAD_REQUEST({
          data: { motivo: "Preço deve ser maior que zero" },
        });
      }

      return exportarProduto(resultado);
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
        data: z.object({ id: z.number() }),
      },
    })
    .handler(async ({ input, errors }) => {
      const resultado = await adicionarEstoque(input.id, input.quantidade);

      if (!resultado) {
        throw errors.NOT_FOUND({ data: { id: input.id } });
      }

      return exportarProduto(resultado);
    }),

  removerEstoque: o
    .route({
      method: "POST",
      path: "/produto/remover-estoque",
      summary: "Remover Estoque",
      description:
        "Remove quantidade do estoque de um produto. Falha se estoque insuficiente.",
      tags: ["Produto"],
    })
    .input(
      z.object({
        id: z.number().int().min(1).describe("ID do produto"),
        quantidade: z.number().int().min(1).describe("Quantidade a remover"),
      })
    )
    .output(produtoSchema)
    .errors({
      NOT_FOUND: {
        message: "Produto não encontrado",
        data: z.object({ id: z.number() }),
      },
      BAD_REQUEST: {
        message: "Estoque insuficiente",
        data: z.object({ id: z.number() }),
      },
    })
    .handler(async ({ input, errors }) => {
      const dados = await produtoRepository.buscarPorId(input.id);

      if (!dados) {
        throw errors.NOT_FOUND({ data: { id: input.id } });
      }

      const resultado = await removerEstoque(input.id, input.quantidade);

      if (!resultado) {
        throw errors.BAD_REQUEST({ data: { id: input.id } });
      }

      return exportarProduto(resultado);
    }),

  alterarPreco: o
    .route({
      method: "POST",
      path: "/produto/alterar-preco",
      summary: "Alterar Preço",
      description: "Altera o preço de um produto. Deve ser maior que zero.",
      tags: ["Produto"],
    })
    .input(
      z.object({
        id: z.number().int().min(1).describe("ID do produto"),
        novoPreco: z.number().min(0.01).describe("Novo preço"),
      })
    )
    .output(produtoSchema)
    .errors({
      NOT_FOUND: {
        message: "Produto não encontrado",
        data: z.object({ id: z.number() }),
      },
    })
    .handler(async ({ input, errors }) => {
      const resultado = await alterarPreco(input.id, input.novoPreco);

      if (!resultado) {
        throw errors.NOT_FOUND({ data: { id: input.id } });
      }

      return exportarProduto(resultado);
    }),

  ativar: o
    .route({
      method: "POST",
      path: "/produto/ativar",
      summary: "Ativar Produto",
      description: "Ativa um produto. Falha se estoque zerado.",
      tags: ["Produto"],
    })
    .input(
      z.object({
        id: z.number().int().min(1).describe("ID do produto"),
      })
    )
    .output(produtoSchema)
    .errors({
      NOT_FOUND: {
        message: "Produto não encontrado",
        data: z.object({ id: z.number() }),
      },
      BAD_REQUEST: {
        message: "Não é possível ativar produto sem estoque",
        data: z.object({ id: z.number() }),
      },
    })
    .handler(async ({ input, errors }) => {
      const dados = await produtoRepository.buscarPorId(input.id);

      if (!dados) {
        throw errors.NOT_FOUND({ data: { id: input.id } });
      }

      const resultado = await ativar(input.id);

      if (!resultado) {
        throw errors.BAD_REQUEST({ data: { id: input.id } });
      }

      return exportarProduto(resultado);
    }),

  desativar: o
    .route({
      method: "POST",
      path: "/produto/desativar",
      summary: "Desativar Produto",
      description: "Desativa um produto.",
      tags: ["Produto"],
    })
    .input(
      z.object({
        id: z.number().int().min(1).describe("ID do produto"),
      })
    )
    .output(produtoSchema)
    .errors({
      NOT_FOUND: {
        message: "Produto não encontrado",
        data: z.object({ id: z.number() }),
      },
    })
    .handler(async ({ input, errors }) => {
      const resultado = await desativar(input.id);

      if (!resultado) {
        throw errors.NOT_FOUND({ data: { id: input.id } });
      }

      return exportarProduto(resultado);
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
    .handler(async ({ input }) => {
      const { itens, proximoCursor } = await produtoRepository.listar(input);
      return {
        itens: await Promise.all(itens.map(exportarProduto)),
        proximoCursor,
      };
    }),

  gerarUrlUpload: o
    .route({
      method: "POST",
      path: "/produto/imagem/upload-url",
      summary: "Gerar URL de Upload",
      description:
        "Gera uma presigned URL para upload direto de imagem ao S3. Válida por 15 minutos.",
      tags: ["Produto"],
    })
    .input(
      z.object({
        contentType: z
          .string()
          .min(1)
          .describe("MIME type da imagem (ex: image/jpeg)"),
      })
    )
    .output(
      z.object({
        key: z.string().describe("Chave S3 gerada para o objeto"),
        uploadUrl: z.url().describe("URL pré-assinada para PUT direto no S3"),
      })
    )
    .handler(async ({ input }) => {
      const key = `produtos/${crypto.randomUUID()}`;
      const uploadUrl = await gerarUrlUpload(key, input.contentType, 900);
      return { key, uploadUrl };
    }),
};
