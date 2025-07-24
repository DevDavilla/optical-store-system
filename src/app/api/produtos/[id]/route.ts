// src/app/api/produtos/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/produtos/[id]
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const produto = await prisma.produto.findUnique({ where: { id } });

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

// PATCH /api/produtos/[id]
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const body = await request.json();

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

    if (body.tipoLenteGrau !== undefined)
      dataToUpdate.tipoLenteGrau = body.tipoLenteGrau;
    if (body.materialLenteGrau !== undefined)
      dataToUpdate.materialLenteGrau = body.materialLenteGrau;
    if (body.tratamentosLenteGrau !== undefined)
      dataToUpdate.tratamentosLenteGrau = Array.isArray(
        body.tratamentosLenteGrau
      )
        ? body.tratamentosLenteGrau
        : [];

    if (body.grauEsfericoOD !== undefined)
      dataToUpdate.grauEsfericoOD =
        typeof body.grauEsfericoOD === "number" ? body.grauEsfericoOD : null;
    if (body.grauCilindricoOD !== undefined)
      dataToUpdate.grauCilindricoOD =
        typeof body.grauCilindricoOD === "number"
          ? body.grauCilindricoOD
          : null;
    if (body.grauEixoOD !== undefined)
      dataToUpdate.grauEixoOD =
        typeof body.grauEixoOD === "number" ? body.grauEixoOD : null;
    if (body.grauAdicaoOD !== undefined)
      dataToUpdate.grauAdicaoOD =
        typeof body.grauAdicaoOD === "number" ? body.grauAdicaoOD : null;

    if (body.grauEsfericoOE !== undefined)
      dataToUpdate.grauEsfericoOE =
        typeof body.grauEsfericoOE === "number" ? body.grauEsfericoOE : null;
    if (body.grauCilindricoOE !== undefined)
      dataToUpdate.grauCilindricoOE =
        typeof body.grauCilindricoOE === "number"
          ? body.grauCilindricoOE
          : null;
    if (body.grauEixoOE !== undefined)
      dataToUpdate.grauEixoOE =
        typeof body.grauEixoOE === "number" ? body.grauEixoOE : null;
    if (body.grauAdicaoOE !== undefined)
      dataToUpdate.grauAdicaoOE =
        typeof body.grauAdicaoOE === "number" ? body.grauAdicaoOE : null;
    if (body.fabricanteLaboratorio !== undefined)
      dataToUpdate.fabricanteLaboratorio = body.fabricanteLaboratorio;

    if (body.curvaBaseLenteContato !== undefined)
      dataToUpdate.curvaBaseLenteContato = body.curvaBaseLenteContato;
    if (body.diametroLenteContato !== undefined)
      dataToUpdate.diametroLenteContato =
        typeof body.diametroLenteContato === "number"
          ? body.diametroLenteContato
          : null;
    if (body.poderLenteContato !== undefined)
      dataToUpdate.poderLenteContato =
        typeof body.poderLenteContato === "number"
          ? body.poderLenteContato
          : null;
    if (body.tipoDescarteLenteContato !== undefined)
      dataToUpdate.tipoDescarteLenteContato = body.tipoDescarteLenteContato;
    if (body.solucoesLenteContato !== undefined)
      dataToUpdate.solucoesLenteContato = body.solucoesLenteContato;

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

// DELETE /api/produtos/[id]
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const produtoDeletado = await prisma.produto.delete({ where: { id } });

    return NextResponse.json(
      { message: "Produto excluído com sucesso!", produto: produtoDeletado },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao excluir produto:", error);
    if (error.code === "P2025") {
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
