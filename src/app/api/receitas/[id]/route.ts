// src/app/api/receitas/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Importa a instância global do PrismaClient

// Função para obter uma receita específica por ID (GET /api/receitas/[id])
// CORREÇÃO AQUI: Assinatura da função ajustada para 'context'
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params; // Acessa params via context.params

    const receita = await prisma.receita.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    if (!receita) {
      return NextResponse.json(
        { message: "Receita não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json(receita, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar receita por ID:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função para atualizar uma receita por ID (PATCH /api/receitas/[id])
// CORREÇÃO AQUI: Assinatura da função ajustada para 'context'
export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params; // Acessa params via context.params
    const body = await request.json();

    const dataToUpdate: { [key: string]: any } = {};

    if (body.dataReceita !== undefined) {
      if (body.dataReceita === null || body.dataReceita === "") {
        dataToUpdate.dataReceita = null;
      } else {
        const parsedDate = new Date(body.dataReceita);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json(
            { message: "Formato de data de receita inválido." },
            { status: 400 }
          );
        }
        dataToUpdate.dataReceita = parsedDate;
      }
    }
    if (body.observacoes !== undefined)
      dataToUpdate.observacoes = body.observacoes;
    if (body.odEsferico !== undefined)
      dataToUpdate.odEsferico =
        typeof body.odEsferico === "number" ? body.odEsferico : null;
    if (body.odCilindrico !== undefined)
      dataToUpdate.odCilindrico =
        typeof body.odCilindrico === "number" ? body.odCilindrico : null;
    if (body.odEixo !== undefined)
      dataToUpdate.odEixo =
        typeof body.odEixo === "number" ? body.odEixo : null;
    if (body.odAdicao !== undefined)
      dataToUpdate.odAdicao =
        typeof body.odAdicao === "number" ? body.odAdicao : null;
    if (body.oeEsferico !== undefined)
      dataToUpdate.oeEsferico =
        typeof body.oeEsferico === "number" ? body.oeEsferico : null;
    if (body.oeCilindrico !== undefined)
      dataToUpdate.oeCilindrico =
        typeof body.oeCilindrico === "number" ? body.oeCilindrico : null;
    if (body.oeEixo !== undefined)
      dataToUpdate.oeEixo =
        typeof body.oeEixo === "number" ? body.oeEixo : null;
    if (body.oeAdicao !== undefined)
      dataToUpdate.oeAdicao =
        typeof body.oeAdicao === "number" ? body.oeAdicao : null;
    if (body.distanciaPupilar !== undefined)
      dataToUpdate.distanciaPupilar =
        typeof body.distanciaPupilar === "number"
          ? body.distanciaPupilar
          : null;
    if (body.distanciaNauseaPupilar !== undefined)
      dataToUpdate.distanciaNauseaPupilar =
        typeof body.distanciaNauseaPupilar === "number"
          ? body.distanciaNauseaPupilar
          : null;
    if (body.alturaLente !== undefined)
      dataToUpdate.alturaLente =
        typeof body.alturaLente === "number" ? body.alturaLente : null;

    const receitaAtualizada = await prisma.receita.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(receitaAtualizada, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao atualizar receita:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Receita não encontrada para atualização." },
        { status: 404 }
      );
    }
    if (
      error instanceof TypeError &&
      (error.message.includes("parseFloat") ||
        error.message.includes("parseInt"))
    ) {
      return NextResponse.json(
        { message: "Dados numéricos inválidos." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao atualizar receita" },
      { status: 500 }
    );
  }
}

// Função para excluir uma receita por ID (DELETE /api/receitas/[id])
// CORREÇÃO AQUI: Assinatura da função ajustada para 'context'
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const receitaDeletada = await prisma.receita.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Receita excluída com sucesso!", receita: receitaDeletada },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao excluir receita:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Receita não encontrada para exclusão." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao excluir receita" },
      { status: 500 }
    );
  }
}
