import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(`${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      dateFilter.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    const whereFilter =
      Object.keys(dateFilter).length > 0 ? { dataVenda: dateFilter } : {};

    // --- 1. Buscar Vendas Detalhadas no Período ---
    const vendas = await prisma.venda.findMany({
      where: whereFilter,
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

    const relatorioProdutosMaisVendidos = Object.values(produtosAgregados).sort(
      (a, b) => b.totalQuantidadeVendida - a.totalQuantidadeVendida
    );

    // --- 3. Buscar e Agregar Agendamentos no Período ---
    const agendamentos = await prisma.agendamento.findMany({
      where:
        Object.keys(dateFilter).length > 0
          ? { dataAgendamento: dateFilter }
          : {},
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
