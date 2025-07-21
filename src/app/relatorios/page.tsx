"use client";

import { useState, useEffect } from "react";
import Notification from "@/components/Notification";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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

  const pageVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case "pago":
      case "concluído":
      case "finalizado":
        return "bg-green-100 text-green-800";
      case "pendente":
      case "agendado":
        return "bg-yellow-100 text-yellow-800";
      case "cancelado":
      case "rejeitado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    if (!loadingAuth) {
      if (!currentUser) {
        router.push("/login");
      } else if (userRole && userRole !== "admin") {
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

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-xl text-center"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Carregando Autenticação...
          </h1>
          <p className="text-gray-600">
            Verificando seu status de login e permissões.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!currentUser || userRole !== "admin") {
    return null;
  }

  if (loading && !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-xl text-center"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Gerando Relatório...
          </h1>
          <p className="text-gray-600">Buscando e processando dados.</p>
        </motion.div>
      </div>
    );
  }

  if (error && !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-xl text-center"
        >
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Erro ao Gerar Relatório
          </h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={handleGenerateReport}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm"
          >
            Tentar Novamente
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto p-8 pt-16"
      initial="hidden"
      animate="show"
      variants={pageVariants}
    >
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg mb-8">
        Relatório Geral de Vendas e Agendamentos
      </h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-xl mb-8"
      >
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
          >
            {loading ? "Gerando..." : "Gerar Relatório"}
          </button>
        </div>
        {error && !reportData && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </motion.div>

      {reportData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-xl mb-8"
        >
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Resultados do Relatório
          </h2>

          {/* Resumo de Vendas */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
              Resumo de Vendas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-blue-700 font-medium">
                  Total de Vendas no Período:
                </p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  R$ {reportData.totalVendasPeriodo.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-green-700 font-medium">
                  Total Geral de Itens Vendidos:
                </p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {reportData.totalItensVendidosGeral}
                </p>
              </div>
            </div>
          </div>

          {/* Vendas Detalhadas */}
          <div className="mb-8 border-t pt-6 mt-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Vendas Detalhadas
            </h3>
            {reportData.vendasDetalhadas.length === 0 ? (
              <p className="text-lg text-gray-600">
                Nenhuma venda encontrada para o período selecionado.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="min-w-full bg-white border border-gray-200">
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
                      <tr
                        key={venda.id}
                        className="border-b even:bg-gray-50 hover:bg-gray-100"
                      >
                        <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                          {new Date(venda.dataVenda).toLocaleDateString(
                            "pt-BR"
                          )}
                        </td>
                        <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                          {venda.cliente?.nome || "N/A"}
                        </td>
                        <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                          R$ {venda.valorTotal.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClasses(
                              venda.statusPagamento
                            )}`}
                          >
                            {venda.statusPagamento}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-800 text-sm">
                          {venda.itens.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="whitespace-nowrap mb-1 last:mb-0"
                            >
                              {item.produto?.nome} x{item.quantidade} ( R$
                              {item.precoUnitario.toFixed(2)})
                            </div>
                          ))}
                        </td>
                        <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                          <Link
                            href={`/vendas/${venda.id}`}
                            className="text-indigo-600 hover:text-indigo-900 font-semibold"
                          >
                            Detalhes
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Produtos Mais Vendidos */}
          <div className="mb-8 border-t pt-6 mt-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Produtos Mais Vendidos
            </h3>
            {reportData.relatorioProdutosMaisVendidos.length === 0 ? (
              <p className="text-lg text-gray-600">
                Nenhum produto vendido no período selecionado.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="min-w-full bg-white border border-gray-200">
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
                        Quantidade Vendida
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        Receita Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.relatorioProdutosMaisVendidos.map((prod) => (
                      <tr
                        key={prod.id}
                        className="border-b even:bg-gray-50 hover:bg-gray-100"
                      >
                        <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                          {prod.nome}
                        </td>
                        <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                          {prod.tipo}
                        </td>
                        <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                          {prod.sku || "N/A"}
                        </td>
                        <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                          {prod.totalQuantidadeVendida}
                        </td>
                        <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                          R$ {prod.totalReceita.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Agendamentos */}
          <div className="mb-8 border-t pt-6 mt-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Agendamentos Detalhados
            </h3>
            {reportData.agendamentosDetalhados.length === 0 ? (
              <p className="text-lg text-gray-600">
                Nenhum agendamento encontrado para o período selecionado.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="min-w-full bg-white border border-gray-200">
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
                        Observações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.agendamentosDetalhados.map((agendamento) => (
                      <tr
                        key={agendamento.id}
                        className="border-b even:bg-gray-50 hover:bg-gray-100"
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
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClasses(
                              agendamento.status
                            )}`}
                          >
                            {agendamento.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-800 text-sm">
                          {agendamento.observacoes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Estatísticas de Agendamento */}
          <div className="mb-8 border-t pt-6 mt-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Estatísticas de Agendamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-100 p-4 rounded-lg shadow-sm text-center">
                <p className="text-sm text-indigo-700 font-semibold">
                  Total de Agendamentos no Período
                </p>
                <p className="text-3xl font-bold text-indigo-900 mt-1">
                  {reportData.totalAgendamentosPeriodo}
                </p>
              </div>

              <div className="bg-yellow-100 p-4 rounded-lg shadow-sm text-center">
                <p className="text-sm text-yellow-700 font-semibold">
                  Agendamentos por Tipo
                </p>
                <ul className="mt-2 text-left text-sm space-y-1 text-yellow-900">
                  {Object.entries(reportData.agendamentosPorTipo).map(
                    ([tipo, quantidade]) => (
                      <li key={tipo}>
                        {tipo}: <strong>{quantidade}</strong>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="bg-green-100 p-4 rounded-lg shadow-sm text-center">
                <p className="text-sm text-green-700 font-semibold">
                  Agendamentos por Status
                </p>
                <ul className="mt-2 text-left text-sm space-y-1 text-green-900">
                  {Object.entries(reportData.agendamentosPorStatus).map(
                    ([status, quantidade]) => (
                      <li key={status}>
                        {status}: <strong>{quantidade}</strong>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-md shadow-lg transition"
            >
              Voltar ao Início
            </Link>
          </div>
        </motion.div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </motion.div>
  );
}
