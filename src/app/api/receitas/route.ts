// src/app/api/receitas/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Função para LISTAR TODAS as receitas (GET /api/receitas)
export async function GET() {
  try {
    const receitas = await prisma.receita.findMany({
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: {
        dataReceita: "desc",
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

    if (!body.clienteId || !body.dataReceita) {
      return NextResponse.json(
        { message: "ID do cliente e data da receita são obrigatórios." },
        { status: 400 }
      );
    }

    const dataReceitaParsed = new Date(body.dataReceita);
    if (isNaN(dataReceitaParsed.getTime())) {
      return NextResponse.json(
        { message: "Formato de data de receita inválido." },
        { status: 400 }
      );
    }

    // Tratamento para campos numéricos
    const distanciaPupilar =
      typeof body.distanciaPupilar === "number" ? body.distanciaPupilar : null;
    const distanciaNauseaPupilar =
      typeof body.distanciaNauseaPupilar === "number"
        ? body.distanciaNauseaPupilar
        : null;
    const alturaLente =
      typeof body.alturaLente === "number" ? body.alturaLente : null; // <-- NOVIDADE AQUI

    const novaReceita = await prisma.receita.create({
      data: {
        cliente: {
          connect: { id: body.clienteId },
        },
        dataReceita: dataReceitaParsed,
        observacoes: body.observacoes,
        odEsferico:
          typeof body.odEsferico === "number" ? body.odEsferico : null,
        odCilindrico:
          typeof body.odCilindrico === "number" ? body.odCilindrico : null,
        odEixo: typeof body.odEixo === "number" ? body.odEixo : null,
        odAdicao: typeof body.odAdicao === "number" ? body.odAdicao : null,
        oeEsferico:
          typeof body.oeEsferico === "number" ? body.oeEsferico : null,
        oeCilindrico:
          typeof body.oeCilindrico === "number" ? body.oeCilindrico : null,
        oeEixo: typeof body.oeEixo === "number" ? body.oeEixo : null,
        oeAdicao: typeof body.oeAdicao === "number" ? body.oeAdicao : null,
        distanciaPupilar: distanciaPupilar,
        distanciaNauseaPupilar: distanciaNauseaPupilar,
        alturaLente: alturaLente, // <-- NOVIDADE AQUI
      },
    });

    return NextResponse.json(novaReceita, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar receita:", error);
    if (error.code === "P2025") {
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
