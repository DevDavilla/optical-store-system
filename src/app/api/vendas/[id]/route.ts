// src/app/api/vendas/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"; // Importe NextRequest
import prisma from "@/lib/prisma"; // Importa a instância global do PrismaClient

// Função para obter uma venda específica por ID (GET /api/vendas/[id])
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const venda = await prisma.venda.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
        itens: {
          include: {
            produto: {
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
  request: NextRequest,
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await prisma.$transaction(async (prismaTransaction) => {
      const itensVenda = await prismaTransaction.itemVenda.findMany({
        where: { vendaId: id },
      });

      for (const item of itensVenda) {
        await prismaTransaction.produto.update({
          where: { id: item.produtoId },
          data: {
            quantidadeEmEstoque: {
              increment: item.quantidade,
            },
          },
        });
      }

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
