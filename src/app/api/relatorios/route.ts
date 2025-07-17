// src/app/api/relatorios/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate"); // Data de início (YYYY-MM-DD)
    const endDate = searchParams.get("endDate"); // Data de fim (YYYY-MM-DD)

    let dateFilter: any = {};

    if (startDate) {
      dateFilter.gte = new Date(`${startDate}T00:00:00.000Z`); // Início do dia
    }
    if (endDate) {
      dateFilter.lte = new Date(`${endDate}T23:59:59.999Z`); // Fim do dia
    }

    // --- 1. Buscar Vendas Detalhadas no Período ---
    const vendas = await prisma.venda.findMany({
      where: {
        dataVenda: dateFilter,
      },
      include: {
        cliente: {
          select: {
            nome: true,
          },
        },
        itens: {
          include: {
            produto: {
              select: {
                id: true,
                nome: true,
                sku: true,
                tipo: true,
                precoVenda: true,
              },
            },
          },
        },
      },
      orderBy: {
        dataVenda: "asc",
      },
    });

    // Calcular totais gerais de vendas
    const totalVendasPeriodo = vendas.reduce(
      (sum, venda) => sum + venda.valorTotal,
      0
    );
    const totalItensVendidosGeral = vendas.reduce(
      (sum, venda) =>
        sum +
        venda.itens.reduce((itemSum, item) => itemSum + item.quantidade, 0),
      0
    );

    // --- 2. Agrupar e Calcular Produtos Mais Vendidos ---
    const produtosAgregados: {
      [productId: string]: {
        id: string;
        nome: string;
        sku?: string;
        tipo: string;
        totalQuantidadeVendida: number;
        totalReceita: number;
      };
    } = {};

    for (const venda of vendas) {
      // Itera sobre as vendas já buscadas
      for (const item of venda.itens) {
        if (item.produto) {
          const { id, nome, sku, tipo } = item.produto;
          if (!produtosAgregados[id]) {
            produtosAgregados[id] = {
              id,
              nome,
              sku,
              tipo,
              totalQuantidadeVendida: 0,
              totalReceita: 0,
            };
          }
          produtosAgregados[id].totalQuantidadeVendida += item.quantidade;
          produtosAgregados[id].totalReceita += item.subtotal;
        }
      }
    }

    // Converter para array e ordenar por quantidade vendida
    const relatorioProdutosMaisVendidos = Object.values(produtosAgregados).sort(
      (a, b) => b.totalQuantidadeVendida - a.totalQuantidadeVendida
    );

    // --- NOVIDADE AQUI: 3. Buscar e Agregar Agendamentos no Período ---
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        dataAgendamento: dateFilter,
      },
      include: {
        cliente: {
          select: {
            nome: true,
            telefone: true,
            email: true,
          },
        },
      },
      orderBy: {
        dataAgendamento: "asc",
      },
    });

    // Agregação de agendamentos por tipo e status
    const agendamentosPorTipo: { [tipo: string]: number } = {};
    const agendamentosPorStatus: { [status: string]: number } = {};
    let totalAgendamentosPeriodo = 0;

    for (const agendamento of agendamentos) {
      totalAgendamentosPeriodo++;
      agendamentosPorTipo[agendamento.tipoAgendamento] =
        (agendamentosPorTipo[agendamento.tipoAgendamento] || 0) + 1;
      agendamentosPorStatus[agendamento.status] =
        (agendamentosPorStatus[agendamento.status] || 0) + 1;
    }

    // Retorna todos os dados consolidados
    return NextResponse.json(
      {
        vendasDetalhadas: vendas,
        totalVendasPeriodo,
        totalItensVendidosGeral,
        relatorioProdutosMaisVendidos,
        // --- NOVIDADE AQUI: Dados de agendamento ---
        agendamentosDetalhados: agendamentos,
        totalAgendamentosPeriodo,
        agendamentosPorTipo,
        agendamentosPorStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao gerar relatório geral:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao gerar relatório" },
      { status: 500 }
    );
  }
}
