// src/app/api/receitas/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Importa a instância global do PrismaClient

// Função para LISTAR TODAS as receitas (GET /api/receitas)
export async function GET() {
  try {
    const receitas = await prisma.receita.findMany({
      include: {
        cliente: {
          // Inclui os dados do cliente relacionado
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
    return NextResponse.json(receitas, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar receitas:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função para CRIAR uma nova receita (POST /api/receitas)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validação básica: clienteId e dataReceita são essenciais
    if (!body.clienteId || !body.dataReceita) {
      return NextResponse.json(
        { message: "ID do cliente e data da receita são obrigatórios." },
        { status: 400 }
      );
    }

    // Garante que a data está no formato Date para o Prisma
    const dataReceitaParsed = new Date(body.dataReceita);
    if (isNaN(dataReceitaParsed.getTime())) {
      // Verifica se a data é válida
      return NextResponse.json(
        { message: "Formato de data de receita inválido." },
        { status: 400 }
      );
    }

    const novaReceita = await prisma.receita.create({
      data: {
        cliente: {
          connect: { id: body.clienteId }, // Conecta a receita a um cliente existente
        },
        dataReceita: dataReceitaParsed,
        observacoes: body.observacoes,
        odEsferico: body.odEsferico,
        odCilindrico: body.odCilindrico,
        odEixo: body.odEixo,
        odAdicao: body.odAdicao,
        oeEsferico: body.oeEsferico,
        oeCilindrico: body.oeCilindrico,
        oeEixo: body.oeEixo,
        oeAdicao: body.oeAdicao,
        distanciaPupilar: body.distanciaPupilar,
      },
    });

    return NextResponse.json(novaReceita, { status: 201 }); // 201 Created
  } catch (error: any) {
    console.error("Erro ao criar receita:", error);
    if (error.code === "P2025") {
      // Por exemplo, se o clienteId não existir
      return NextResponse.json(
        { message: "Cliente associado não encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao criar receita" },
      { status: 500 }
    );
  }
}
