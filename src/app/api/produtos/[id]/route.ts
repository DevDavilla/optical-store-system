// src/app/api/produtos/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Importa a instância global do PrismaClient

// Função para obter um produto específico por ID (GET /api/produtos/[id])
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // Pega o ID da URL dinâmica

    const produto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produto) {
      return NextResponse.json(
        { message: "Produto não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(produto, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar produto por ID:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função para atualizar um produto por ID (PATCH /api/produtos/[id])
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Crie um novo objeto contendo apenas os campos válidos para atualização.
    const dataToUpdate: { [key: string]: any } = {};

    if (body.nome !== undefined) dataToUpdate.nome = body.nome;
    if (body.tipo !== undefined) dataToUpdate.tipo = body.tipo;
    if (body.marca !== undefined) dataToUpdate.marca = body.marca;
    if (body.modelo !== undefined) dataToUpdate.modelo = body.modelo;
    if (body.quantidadeEmEstoque !== undefined)
      dataToUpdate.quantidadeEmEstoque =
        typeof body.quantidadeEmEstoque === "number"
          ? body.quantidadeEmEstoque
          : 0;
    if (body.precoCusto !== undefined)
      dataToUpdate.precoCusto =
        typeof body.precoCusto === "number" ? body.precoCusto : null;
    if (body.precoVenda !== undefined)
      dataToUpdate.precoVenda =
        typeof body.precoVenda === "number" ? body.precoVenda : null;
    if (body.fornecedor !== undefined)
      dataToUpdate.fornecedor = body.fornecedor;
    if (body.descricao !== undefined) dataToUpdate.descricao = body.descricao;
    if (body.sku !== undefined) dataToUpdate.sku = body.sku;

    const produtoAtualizado = await prisma.produto.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(produtoAtualizado, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao atualizar produto:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Produto não encontrado para atualização." },
        { status: 404 }
      );
    }
    if (error.code === "P2002") {
      // Se o SKU for duplicado
      return NextResponse.json(
        { message: "SKU já cadastrado para outro produto." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao atualizar produto" },
      { status: 500 }
    );
  }
}

// Função para excluir um produto por ID (DELETE /api/produtos/[id])
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const produtoDeletado = await prisma.produto.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Produto excluído com sucesso!", produto: produtoDeletado },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao excluir produto:", error);
    if (error.code === "P2025") {
      // Prisma error code for record not found
      return NextResponse.json(
        { message: "Produto não encontrado para exclusão." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao excluir produto" },
      { status: 500 }
    );
  }
}
