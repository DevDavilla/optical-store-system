// src/app/api/vendas/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Importa a instância global do PrismaClient

// Função para LISTAR TODAS as vendas (GET /api/vendas)
export async function GET() {
  try {
    const vendas = await prisma.venda.findMany({
      include: {
        cliente: {
          // Inclui os dados do cliente que fez a venda
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
        itens: {
          // Inclui os itens de venda associados
          include: {
            produto: {
              // Inclui os dados do produto dentro de cada item
              select: {
                id: true,
                nome: true,
                sku: true,
                tipo: true,
              },
            },
          },
        },
      },
      orderBy: {
        dataVenda: "desc", // Ordena por data da venda (mais recente primeiro)
      },
    });
    return NextResponse.json(vendas, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função para CRIAR uma nova venda (POST /api/vendas)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clienteId, observacoes, statusPagamento, itens } = body;

    // Validação básica
    if (!clienteId || !itens || itens.length === 0) {
      return NextResponse.json(
        { message: "Cliente e itens da venda são obrigatórios." },
        { status: 400 }
      );
    }

    let valorTotalVenda = 0;

    // Usar uma transação para garantir que todas as operações (criar venda, criar itens, atualizar estoque)
    // sejam atômicas. Se algo falhar, tudo é revertido.
    const result = await prisma.$transaction(async (prismaTransaction) => {
      // 1. Criar a Venda
      const novaVenda = await prismaTransaction.venda.create({
        data: {
          cliente: {
            connect: { id: clienteId },
          },
          dataVenda: new Date(), // Data e hora atual da venda
          valorTotal: 0, // Valor inicial, será atualizado após calcular itens
          statusPagamento: statusPagamento || "Pendente",
          observacoes: observacoes,
        },
      });

      // 2. Processar e criar os Itens de Venda, e atualizar o estoque
      const itensCriados = [];
      for (const item of itens) {
        if (!item.produtoId || !item.quantidade || item.quantidade <= 0) {
          throw new Error(
            "Item de venda inválido: produtoId e quantidade são obrigatórios e positivos."
          );
        }

        // Buscar o produto para obter o preço de venda atual e verificar estoque
        const produto = await prismaTransaction.produto.findUnique({
          where: { id: item.produtoId },
        });

        if (!produto) {
          throw new Error(`Produto com ID ${item.produtoId} não encontrado.`);
        }
        if (produto.quantidadeEmEstoque < item.quantidade) {
          throw new Error(
            `Estoque insuficiente para o produto ${produto.nome}. Disponível: ${produto.quantidadeEmEstoque}, Solicitado: ${item.quantidade}.`
          );
        }

        const precoUnitario = item.precoUnitario ?? produto.precoVenda ?? 0; // Usa preço do item, ou do produto, ou 0
        const subtotal = precoUnitario * item.quantidade;
        valorTotalVenda += subtotal;

        // Criar o ItemVenda
        const novoItemVenda = await prismaTransaction.itemVenda.create({
          data: {
            venda: { connect: { id: novaVenda.id } },
            produto: { connect: { id: produto.id } },
            quantidade: item.quantidade,
            precoUnitario: precoUnitario,
            subtotal: subtotal,
          },
        });
        itensCriados.push(novoItemVenda);

        // Atualizar a quantidade em estoque do produto
        await prismaTransaction.produto.update({
          where: { id: produto.id },
          data: {
            quantidadeEmEstoque: {
              decrement: item.quantidade, // Decrementa a quantidade vendida
            },
          },
        });
      }

      // 3. Atualizar o Valor Total da Venda
      const vendaFinal = await prismaTransaction.venda.update({
        where: { id: novaVenda.id },
        data: {
          valorTotal: valorTotalVenda,
        },
      });

      return { venda: vendaFinal, itens: itensCriados };
    });

    return NextResponse.json(result.venda, { status: 201 }); // Retorna a venda criada
  } catch (error: any) {
    console.error("Erro ao criar venda:", error);
    // Tratar erros específicos, como produto não encontrado ou estoque insuficiente
    if (
      error.message.includes("Produto com ID") ||
      error.message.includes("Estoque insuficiente")
    ) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (error.code === "P2025") {
      // ClienteId não encontrado
      return NextResponse.json(
        { message: "Cliente associado não encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao criar venda" },
      { status: 500 }
    );
  }
}
