// src/app/api/stats/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Importa a instância global do PrismaClient

export async function GET() {
  try {
    // Conta o total de clientes
    const totalClientes = await prisma.cliente.count();

    // Conta o total de receitas
    const totalReceitas = await prisma.receita.count();

    // Conta o total de agendamentos com status "Pendente"
    const totalAgendamentosPendentes = await prisma.agendamento.count({
      where: {
        status: "Pendente",
      },
    });

    // Retorna as estatísticas como JSON
    return NextResponse.json(
      {
        totalClientes,
        totalReceitas,
        totalAgendamentosPendentes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao buscar estatísticas" },
      { status: 500 }
    );
  }
}
