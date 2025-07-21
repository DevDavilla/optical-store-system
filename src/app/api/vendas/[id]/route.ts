// src/app/api/vendas/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Importa a instância global do PrismaClient

// Função para obter uma venda específica por ID (GET /api/vendas/[id])
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // Pega o ID da URL dinâmica

    const venda = await prisma.venda.findUnique({
      where: { id },
      include: {
        cliente: {
          // Inclui os dados do cliente
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
        itens: {
          // Inclui os itens da venda
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
    });

    if (!venda) {
      return NextResponse.json(
        { message: "Venda não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json(venda, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar venda por ID:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função para atualizar uma venda por ID (PATCH /api/vendas/[id])
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const dataToUpdate: { [key: string]: any } = {};

    if (body.statusPagamento !== undefined)
      dataToUpdate.statusPagamento = body.statusPagamento;
    if (body.observacoes !== undefined)
      dataToUpdate.observacoes = body.observacoes;
    // Note: Não estamos permitindo alterar clienteId, dataVenda, valorTotal ou itens diretamente aqui
    // Alterações em itens de venda exigem lógica complexa de estoque (incrementar/decrementar)

    const vendaAtualizada = await prisma.venda.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(vendaAtualizada, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao atualizar venda:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Venda não encontrada para atualização." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao atualizar venda" },
      { status: 500 }
    );
  }
}

// Função para excluir uma venda por ID (DELETE /api/vendas/[id])
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Usar uma transação para garantir que a exclusão da venda e a reversão do estoque sejam atômicas.
    const result = await prisma.$transaction(async (prismaTransaction) => {
      // 1. Buscar os itens da venda antes de deletá-la
      const itensVenda = await prismaTransaction.itemVenda.findMany({
        where: { vendaId: id },
      });

      // 2. Reverter o estoque para cada produto
      for (const item of itensVenda) {
        await prismaTransaction.produto.update({
          where: { id: item.produtoId },
          data: {
            quantidadeEmEstoque: {
              increment: item.quantidade, // Incrementa a quantidade de volta ao estoque
            },
          },
        });
      }

      // 3. Deletar a venda (e seus itens, devido ao onDelete: Cascade na relação Venda -> ItemVenda)
      const vendaDeletada = await prismaTransaction.venda.delete({
        where: { id },
      });

      return vendaDeletada;
    });

    return NextResponse.json(
      { message: "Venda excluída com sucesso!", venda: result },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao excluir venda:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Venda não encontrada para exclusão." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao excluir venda" },
      { status: 500 }
    );
  }
}
