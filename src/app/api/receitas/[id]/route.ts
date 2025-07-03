// src/app/api/receitas/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Importa a instância global do PrismaClient

// Função para obter uma receita específica por ID (GET /api/receitas/[id])
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // Pega o ID da URL dinâmica

    const receita = await prisma.receita.findUnique({
      where: { id },
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
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Crie um novo objeto contendo apenas os campos válidos para atualização.
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
      dataToUpdate.odEsferico = parseFloat(body.odEsferico);
    if (body.odCilindrico !== undefined)
      dataToUpdate.odCilindrico = parseFloat(body.odCilindrico);
    if (body.odEixo !== undefined)
      dataToUpdate.odEixo = parseInt(body.odEixo, 10);
    if (body.odAdicao !== undefined)
      dataToUpdate.odAdicao = parseFloat(body.odAdicao);
    if (body.oeEsferico !== undefined)
      dataToUpdate.oeEsferico = parseFloat(body.oeEsferico);
    if (body.oeCilindrico !== undefined)
      dataToUpdate.oeCilindrico = parseFloat(body.oeCilindrico);
    if (body.oeEixo !== undefined)
      dataToUpdate.oeEixo = parseInt(body.oeEixo, 10);
    if (body.oeAdicao !== undefined)
      dataToUpdate.oeAdicao = parseFloat(body.oeAdicao);
    if (body.distanciaPupilar !== undefined)
      dataToUpdate.distanciaPupilar = parseFloat(body.distanciaPupilar);

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
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
      // Prisma error code for record not found
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
