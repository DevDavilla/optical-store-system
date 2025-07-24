// src/app/api/agendamentos/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Importa a instância global do PrismaClient

// Função para LISTAR TODOS os agendamentos (GET /api/agendamentos)
export async function GET() {
  try {
    const agendamentos = await prisma.agendamento.findMany({
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
      orderBy: {
        dataAgendamento: "asc", // Ordena por data (crescente)
      },
    });
    return NextResponse.json(agendamentos, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função para CRIAR um novo agendamento (POST /api/agendamentos)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validação básica: clienteId, dataAgendamento, horaAgendamento e tipoAgendamento são essenciais
    if (
      !body.clienteId ||
      !body.dataAgendamento ||
      !body.horaAgendamento ||
      !body.tipoAgendamento
    ) {
      return NextResponse.json(
        {
          message:
            "Cliente, data, hora e tipo de agendamento são obrigatórios.",
        },
        { status: 400 }
      );
    }

    // Garante que a data está no formato Date para o Prisma
    const dataAgendamentoParsed = new Date(body.dataAgendamento);
    if (isNaN(dataAgendamentoParsed.getTime())) {
      // Verifica se a data é válida
      return NextResponse.json(
        { message: "Formato de data de agendamento inválido." },
        { status: 400 }
      );
    }

    const novoAgendamento = await prisma.agendamento.create({
      data: {
        cliente: {
          connect: { id: body.clienteId }, // Conecta o agendamento a um cliente existente
        },
        dataAgendamento: dataAgendamentoParsed,
        horaAgendamento: body.horaAgendamento,
        tipoAgendamento: body.tipoAgendamento,
        observacoes: body.observacoes,
        status: body.status || "Pendente", // Usa o status fornecido ou 'Pendente' como padrão
      },
    });

    return NextResponse.json(novoAgendamento, { status: 201 }); // 201 Created
  } catch (error: unknown) {
    console.error("Erro ao criar agendamento:", error);
    if (error.code === "P2025") {
      // Por exemplo, se o clienteId não existir
      return NextResponse.json(
        { message: "Cliente associado não encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao criar agendamento" },
      { status: 500 }
    );
  }
}
