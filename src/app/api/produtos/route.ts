// src/app/api/produtos/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Importa a instância global do PrismaClient

// Função para LISTAR TODOS os produtos (GET /api/produtos)
export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: {
        nome: "asc", // Ordena por nome
      },
    });
    return NextResponse.json(produtos, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função para CRIAR um novo produto (POST /api/produtos)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.nome || !body.tipo) {
      return NextResponse.json(
        { message: "Nome e Tipo do produto são obrigatórios." },
        { status: 400 }
      );
    }

    const quantidadeEmEstoque =
      typeof body.quantidadeEmEstoque === "number"
        ? body.quantidadeEmEstoque
        : 0;
    const precoCusto =
      typeof body.precoCusto === "number" ? body.precoCusto : null;
    const precoVenda =
      typeof body.precoVenda === "number" ? body.precoVenda : null;
    const tratamentosLenteGrau = Array.isArray(body.tratamentosLenteGrau)
      ? body.tratamentosLenteGrau
      : [];

    const grauEsfericoOD =
      typeof body.grauEsfericoOD === "number" ? body.grauEsfericoOD : null;
    const grauCilindricoOD =
      typeof body.grauCilindricoOD === "number" ? body.grauCilindricoOD : null;
    const grauEixoOD =
      typeof body.grauEixoOD === "number" ? body.grauEixoOD : null;
    const grauAdicaoOD =
      typeof body.grauAdicaoOD === "number" ? body.grauAdicaoOD : null;

    const grauEsfericoOE =
      typeof body.grauEsfericoOE === "number" ? body.grauEsfericoOE : null;
    const grauCilindricoOE =
      typeof body.grauCilindricoOE === "number" ? body.grauCilindricoOE : null;
    const grauEixoOE =
      typeof body.grauEixoOE === "number" ? body.grauEixoOE : null;
    const grauAdicaoOE =
      typeof body.grauAdicaoOE === "number" ? body.grauAdicaoOE : null;

    const diametroLenteContato =
      typeof body.diametroLenteContato === "number"
        ? body.diametroLenteContato
        : null;
    const poderLenteContato =
      typeof body.poderLenteContato === "number"
        ? body.poderLenteContato
        : null;

    const novoProduto = await prisma.produto.create({
      data: {
        nome: body.nome,
        tipo: body.tipo,
        marca: body.marca || undefined,
        modelo: body.modelo || undefined,
        quantidadeEmEstoque,
        precoCusto,
        precoVenda,
        fornecedor: body.fornecedor || undefined,
        descricao: body.descricao || undefined,
        sku: body.sku || undefined,

        tipoLenteGrau: body.tipoLenteGrau || undefined,
        materialLenteGrau: body.materialLenteGrau || undefined,
        tratamentosLenteGrau:
          tratamentosLenteGrau.length > 0 ? tratamentosLenteGrau : undefined,
        grauEsfericoOD,
        grauCilindricoOD,
        grauEixoOD,
        grauAdicaoOD,
        grauEsfericoOE,
        grauCilindricoOE,
        grauEixoOE,
        grauAdicaoOE,
        fabricanteLaboratorio: body.fabricanteLaboratorio || undefined,

        curvaBaseLenteContato: body.curvaBaseLenteContato || undefined,
        diametroLenteContato,
        poderLenteContato,
        tipoDescarteLenteContato: body.tipoDescarteLenteContato || undefined,
        solucoesLenteContato: body.solucoesLenteContato || undefined,
      },
    });

    return NextResponse.json(novoProduto, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar produto:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "SKU já cadastrado." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao criar produto" },
      { status: 500 }
    );
  }
}
