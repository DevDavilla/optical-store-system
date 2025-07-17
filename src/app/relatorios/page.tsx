// src/app/relatorios/page.tsx
"use client";

import { useState, useEffect } from "react";
import Notification from "@/components/Notification";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Interfaces para os dados do relatório consolidado
interface ClienteRelatorio {
  nome: string;
}

interface ProdutoRelatorioItem {
  nome: string;
  tipo: string;
  sku?: string;
}

interface ItemVendaRelatorio {
  id: string;
  produto?: ProdutoRelatorioItem;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

interface VendaRelatorioDetalhada {
  id: string;
  cliente?: ClienteRelatorio;
  dataVenda: string;
  valorTotal: number;
  statusPagamento: string;
  observacoes?: string;
  itens: ItemVendaRelatorio[];
}

interface ProdutoRelatorioAgregado {
  id: string;
  nome: string;
  sku?: string;
  tipo: string;
  totalQuantidadeVendida: number;
  totalReceita: number;
}

interface ClienteAgendamentoRelatorio {
  nome: string;
  telefone?: string;
  email?: string;
}

interface AgendamentoRelatorioDetalhado {
  id: string;
  cliente?: ClienteAgendamentoRelatorio;
  dataAgendamento: string;
  horaAgendamento: string;
  tipoAgendamento: string;
  status: string;
  observacoes?: string;
}

interface RelatorioGeralData {
  vendasDetalhadas: VendaRelatorioDetalhada[];
  totalVendasPeriodo: number;
  totalItensVendidosGeral: number;
  relatorioProdutosMaisVendidos: ProdutoRelatorioAgregado[];
  agendamentosDetalhados: AgendamentoRelatorioDetalhado[];
  totalAgendamentosPeriodo: number;
  agendamentosPorTipo: { [tipo: string]: number };
  agendamentosPorStatus: { [status: string]: number };
}

export default function RelatorioGeralPage() {
  const { currentUser, loadingAuth, userRole } = useAuth();
  const router = useRouter();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState<RelatorioGeralData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // --- LÓGICA DE PROTEÇÃO DE ROTA POR PAPEL ---
  useEffect(() => {
    if (!loadingAuth) {
      if (!currentUser) {
        router.push("/login");
      } else if (userRole && userRole !== "admin") {
        // APENAS 'admin' pode acessar Relatórios
        setNotification({
          message:
            "Acesso negado. Apenas administradores podem ver relatórios.",
          type: "error",
        });
        router.push("/");
      }
    }
  }, [currentUser, loadingAuth, userRole, router]);

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportData(null);
    setError(null);
    setNotification(null);

    if (!startDate || !endDate) {
      setNotification({
        message: "Por favor, selecione as datas de início e fim.",
        type: "error",
      });
      setLoading(false);
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setNotification({
        message: "A data de início não pode ser posterior à data de fim.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("startDate", startDate);
      queryParams.append("endDate", endDate);

      const response = await fetch(`/api/relatorios?${queryParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Erro HTTP! Status: ${response.status}`
        );
      }
      const data: RelatorioGeralData = await response.json();
      setReportData(data);
      setNotification({
        message: "Relatório gerado com sucesso!",
        type: "success",
      });
    } catch (err: any) {
      console.error("Falha ao gerar relatório:", err);
      setError("Não foi possível gerar o relatório. Tente novamente.");
      setNotification({
        message: err.message || "Erro ao gerar relatório.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Renderização Condicional com base no status de autenticação e papel ---
  if (loadingAuth) {
    return (
      <div className="container mx-auto p-8 text-center pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Carregando Autenticação...
        </h1>
        <p>Verificando seu status de login e permissões.</p>
      </div>
    );
  }

  if (!currentUser || userRole !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto p-8 pt-16">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg mb-8">
        Relatório Geral de Vendas e Produtos
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Gerar Relatório por Período
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Data Início:
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700"
            >
              Data Fim:
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-semibold py-2 px-5 rounded-full shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Gerando..." : "Gerar Relatório"}
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {reportData && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Resultados do Relatório
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg mb-6 border-b pb-4">
            <h3 className="md:col-span-2 text-xl font-semibold mb-2 text-gray-700">
              Resumo de Vendas
            </h3>
            <p>
              <strong>Total de Vendas no Período:</strong> R${" "}
              {reportData.totalVendasPeriodo.toFixed(2)}
            </p>
            <p>
              <strong>Total Geral de Itens Vendidos:</strong>{" "}
              {reportData.totalItensVendidosGeral}
            </p>
          </div>

          <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-700">
            Vendas Detalhadas
          </h3>
          {reportData.vendasDetalhadas.length === 0 ? (
            <p className="text-lg text-gray-600">
              Nenhuma venda encontrada para o período selecionado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Itens
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.vendasDetalhadas.map((venda) => (
                    <tr key={venda.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {new Date(venda.dataVenda).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {venda.cliente?.nome || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        R$ {venda.valorTotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {venda.statusPagamento}
                      </td>
                      <td className="px-4 py-4 text-gray-800 text-sm">
                        {venda.itens.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="whitespace-nowrap"
                          >
                            {item.quantidade}x{" "}
                            {item.produto?.nome || "Desconhecido"}
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Link href={`/vendas/${venda.id}`}>
                          <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded text-xs">
                            Ver Venda
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 className="text-xl font-semibold mb-3 mt-8 text-gray-700">
            Produtos Mais Vendidos (por Quantidade)
          </h3>
          {reportData.relatorioProdutosMaisVendidos.length === 0 ? (
            <p className="text-lg text-gray-600">
              Nenhum produto encontrado para o período selecionado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Qtd. Vendida
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Receita Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.relatorioProdutosMaisVendidos.map((produto) => (
                    <tr key={produto.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {produto.nome}
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {produto.tipo}
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {produto.sku || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {produto.totalQuantidadeVendida}
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        R$ {produto.totalReceita.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 className="text-xl font-semibold mb-3 mt-8 text-gray-700">
            Resumo de Agendamentos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg mb-6">
            <p>
              <strong>Total de Agendamentos no Período:</strong>{" "}
              {reportData.totalAgendamentosPeriodo}
            </p>
            <div>
              <p className="font-semibold text-gray-700">Por Tipo:</p>
              {Object.entries(reportData.agendamentosPorTipo).length > 0 ? (
                Object.entries(reportData.agendamentosPorTipo).map(
                  ([tipo, count]) => (
                    <p key={tipo} className="text-sm text-gray-600 ml-4">
                      {tipo}: {count}
                    </p>
                  )
                )
              ) : (
                <p className="text-sm text-gray-600 ml-4">
                  Nenhum agendamento por tipo.
                </p>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-700">Por Status:</p>
              {Object.entries(reportData.agendamentosPorStatus).length > 0 ? (
                Object.entries(reportData.agendamentosPorStatus).map(
                  ([status, count]) => (
                    <p key={status} className="text-sm text-gray-600 ml-4">
                      {status}: {count}
                    </p>
                  )
                )
              ) : (
                <p className="text-sm text-gray-600 ml-4">
                  Nenhum agendamento por status.
                </p>
              )}
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-3 mt-8 text-gray-700">
            Agendamentos Detalhados
          </h3>
          {reportData.agendamentosDetalhados.length === 0 ? (
            <p className="text-lg text-gray-600">
              Nenhum agendamento encontrado para o período selecionado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Hora
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.agendamentosDetalhados.map((agendamento) => (
                    <tr
                      key={agendamento.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {new Date(
                          agendamento.dataAgendamento
                        ).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {agendamento.horaAgendamento}
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {agendamento.cliente?.nome || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {agendamento.tipoAgendamento}
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {agendamento.status}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Link href={`/agendamentos/${agendamento.id}`}>
                          <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded text-xs">
                            Ver Detalhes
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
