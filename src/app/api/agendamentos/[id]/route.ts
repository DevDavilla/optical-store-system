// src/app/api/agendamentos/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Importa a instância global do PrismaClient

// Função para obter um agendamento específico por ID (GET /api/agendamentos/[id])
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // Pega o ID da URL dinâmica

    const agendamento = await prisma.agendamento.findUnique({
      where: { id },
      include: {
        cliente: {
          // Inclui os dados do cliente relacionado
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
      },
    });

    if (!agendamento) {
      return NextResponse.json(
        { message: "Agendamento não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(agendamento, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar agendamento por ID:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função para atualizar um agendamento por ID (PATCH /api/agendamentos/[id])
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Crie um novo objeto contendo apenas os campos válidos para atualização.
    const dataToUpdate: { [key: string]: any } = {};

    if (body.dataAgendamento !== undefined) {
      if (body.dataAgendamento === null || body.dataAgendamento === "") {
        dataToUpdate.dataAgendamento = null;
      } else {
        const parsedDate = new Date(body.dataAgendamento);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json(
            { message: "Formato de data de agendamento inválido." },
            { status: 400 }
          );
        }
        dataToUpdate.dataAgendamento = parsedDate;
      }
    }
    if (body.horaAgendamento !== undefined)
      dataToUpdate.horaAgendamento = body.horaAgendamento;
    if (body.tipoAgendamento !== undefined)
      dataToUpdate.tipoAgendamento = body.tipoAgendamento;
    if (body.observacoes !== undefined)
      dataToUpdate.observacoes = body.observacoes;
    if (body.status !== undefined) dataToUpdate.status = body.status;

    // Note: clienteId não deve ser alterado via PATCH/PUT direto no agendamento.

    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(agendamentoAtualizado, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao atualizar agendamento:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Agendamento não encontrado para atualização." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao atualizar agendamento" },
      { status: 500 }
    );
  }
}

// Função para excluir um agendamento por ID (DELETE /api/agendamentos/[id])
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const agendamentoDeletado = await prisma.agendamento.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        message: "Agendamento excluído com sucesso!",
        agendamento: agendamentoDeletado,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao excluir agendamento:", error);
    if (error.code === "P2025") {
      // Prisma error code for record not found
      return NextResponse.json(
        { message: "Agendamento não encontrado para exclusão." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao excluir agendamento" },
      { status: 500 }
    );
  }
}
