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

    // Validação básica: nome e tipo são obrigatórios
    if (!body.nome || !body.tipo) {
      return NextResponse.json(
        { message: "Nome e Tipo do produto são obrigatórios." },
        { status: 400 }
      );
    }

    // Garante que campos numéricos são tratados corretamente
    const quantidadeEmEstoque =
      typeof body.quantidadeEmEstoque === "number"
        ? body.quantidadeEmEstoque
        : 0;
    const precoCusto =
      typeof body.precoCusto === "number" ? body.precoCusto : null;
    const precoVenda =
      typeof body.precoVenda === "number" ? body.precoVenda : null;

    const novoProduto = await prisma.produto.create({
      data: {
        nome: body.nome,
        tipo: body.tipo,
        marca: body.marca,
        modelo: body.modelo,
        quantidadeEmEstoque: quantidadeEmEstoque,
        precoCusto: precoCusto,
        precoVenda: precoVenda,
        fornecedor: body.fornecedor,
        descricao: body.descricao,
        sku: body.sku,
      },
    });

    return NextResponse.json(novoProduto, { status: 201 }); // 201 Created
  } catch (error: any) {
    console.error("Erro ao criar produto:", error);
    if (error.code === "P2002") {
      // Se o SKU for duplicado
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
