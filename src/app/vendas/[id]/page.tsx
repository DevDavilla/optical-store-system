"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface ClienteSimples {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
}

interface ProdutoSimples {
  id: string;
  nome: string;
  sku?: string;
  tipo: string;
  marca?: string;
  modelo?: string;
}

interface ItemVenda {
  id: string;
  vendaId: string;
  produtoId: string;
  produto?: ProdutoSimples;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

interface Venda {
  id: string;
  clienteId: string;
  cliente?: ClienteSimples;
  dataVenda: string;
  valorTotal: number;
  statusPagamento: string;
  observacoes?: string;
  itens: ItemVenda[];
  createdAt: string;
  updatedAt: string;
}

export default function VendaDetailPage() {
  const { currentUser, loadingAuth, userRole } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [venda, setVenda] = useState<Venda | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loadingAuth) {
      if (!currentUser) {
        router.push("/login");
      } else if (!id) {
        setError("ID da venda não fornecido.");
        setLoading(false);
      } else {
        fetchVenda();
      }
    }
  }, [currentUser, loadingAuth, id, router]);

  async function fetchVenda() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/vendas/${id}`);
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      const data: Venda = await response.json();
      setVenda(data);
    } catch (err) {
      console.error("Falha ao buscar detalhes da venda:", err);
      setError("Não foi possível carregar os detalhes da venda.");
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString("pt-BR") : "N/A";

  const formatDateTime = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleString("pt-BR") : "N/A";

  const formatCurrency = (value?: number) =>
    `R$ ${value?.toFixed(2) ?? "0.00"}`;

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 pt-16 bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa]">
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-xl text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Carregando Autenticação...
          </h1>
          <p className="text-gray-600">Verificando seu status de login.</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 pt-16 bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa]">
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-xl text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Detalhes da Venda
          </h1>
          <p className="text-gray-600">Carregando detalhes da venda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 pt-16 bg-gradient-to-br from-[#fff1f1] via-white to-[#fff1f1]">
        <div className="bg-red-50 border border-red-300 rounded-lg p-8 shadow-md text-center max-w-lg">
          <h1 className="text-3xl font-bold text-red-700 mb-4">
            Erro ao carregar venda
          </h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchVenda}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!venda) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 pt-16">
        <p className="text-xl text-gray-600">Venda não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 pt-16 max-w-6xl">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-900">
          Detalhes da Venda
        </h1>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-b pb-8 mb-8 text-gray-800">
          <h2 className="lg:col-span-3 text-2xl font-semibold mb-4 text-gray-700">
            Informações da Venda
          </h2>
          <p>
            <strong>ID da Venda:</strong> {venda.id}
          </p>
          <p>
            <strong>Cliente:</strong> {venda.cliente?.nome ?? "N/A"}
          </p>
          <p>
            <strong>Data da Venda:</strong> {formatDate(venda.dataVenda)}
          </p>
          <p>
            <strong>Valor Total:</strong> {formatCurrency(venda.valorTotal)}
          </p>
          <p>
            <strong>Status Pagamento:</strong>{" "}
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                venda.statusPagamento.toLowerCase() === "pago"
                  ? "bg-green-100 text-green-800"
                  : venda.statusPagamento.toLowerCase() === "pendente"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {venda.statusPagamento}
            </span>
          </p>
          <p className="md:col-span-2 lg:col-span-3">
            <strong>Observações:</strong> {venda.observacoes || "Nenhuma"}
          </p>
          <p>
            <strong>Criado em:</strong> {formatDateTime(venda.createdAt)}
          </p>
          <p>
            <strong>Última atualização:</strong>{" "}
            {formatDateTime(venda.updatedAt)}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Itens da Venda
          </h2>
          {venda.itens.length === 0 ? (
            <p className="text-gray-600 text-lg">Nenhum item registrado.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full border border-gray-200 bg-white">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="text-left py-3 px-4 uppercase tracking-wide text-gray-600 text-sm font-semibold">
                      Produto
                    </th>
                    <th className="text-left py-3 px-4 uppercase tracking-wide text-gray-600 text-sm font-semibold">
                      Tipo
                    </th>
                    <th className="text-left py-3 px-4 uppercase tracking-wide text-gray-600 text-sm font-semibold">
                      Quantidade
                    </th>
                    <th className="text-left py-3 px-4 uppercase tracking-wide text-gray-600 text-sm font-semibold">
                      Preço Unitário
                    </th>
                    <th className="text-left py-3 px-4 uppercase tracking-wide text-gray-600 text-sm font-semibold">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {venda.itens.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b even:bg-gray-50 hover:bg-gray-100"
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-blue-600 hover:underline">
                        <Link href={`/produtos/${item.produtoId}`}>
                          {item.produto?.nome ?? "Produto Desconhecido"}
                        </Link>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-gray-800">
                        {item.produto?.tipo ?? "N/A"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-gray-800">
                        {item.quantidade}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-gray-800">
                        {formatCurrency(item.precoUnitario)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-gray-800">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="mt-10 flex justify-center">
          <Link href="/vendas">
            <button className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-md shadow-md transition">
              Voltar para a Lista de Vendas
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
