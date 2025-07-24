// src/app/vendas/[id]/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Importa motion para animações

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

  // Função para buscar a venda (envolvida em useCallback)
  const fetchVenda = useCallback(async () => {
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
  }, [id]); // Depende de 'id' para refetch quando o ID da URL muda

  // Proteção de rota e carregamento de dados
  useEffect(() => {
    if (!loadingAuth) {
      if (!currentUser) {
        router.push("/login");
      } else {
        if (id) {
          fetchVenda(); // Chama a função useCallback
        } else {
          setLoading(false);
          setError("ID da venda não fornecido.");
        }
      }
    }
  }, [currentUser, loadingAuth, router, id, fetchVenda]);

  // Formatação de datas e valores
  const formattedDataVenda = venda?.dataVenda
    ? new Date(venda.dataVenda).toLocaleDateString("pt-BR")
    : "N/A";
  const formattedValorTotal = `R$ ${venda?.valorTotal.toFixed(2) || "0.00"}`;
  const formattedCreatedAt = venda?.createdAt
    ? new Date(venda.createdAt).toLocaleString("pt-BR")
    : "N/A";
  const formattedUpdatedAt = venda?.updatedAt
    ? new Date(venda.updatedAt).toLocaleString("pt-BR")
    : "N/A";

  // Framer Motion variants para animação de entrada
  const pageVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // --- TELAS DE CARREGAMENTO E ERRO PADRONIZADAS ---
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
          <p className="text-gray-600">Verificando seu status de login.</p>
        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-xl text-center"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Carregando Detalhes da Venda...
          </h1>
          <p className="text-gray-600">Buscando dados do sistema.</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-xl text-center"
        >
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Erro ao Carregar Venda
          </h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchVenda}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm"
          >
            Tentar Novamente
          </button>
        </motion.div>
      </div>
    );
  }

  if (!venda) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-xl text-center"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Venda não encontrada
          </h1>
          <p className="text-gray-600">
            A venda com o ID especificado não foi encontrada.
          </p>
          <Link href="/vendas">
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm">
              Voltar para Vendas
            </button>
          </Link>
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
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg mb-8">
          Detalhes da Venda
        </h1>

        {/* Informações da Venda */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-lg mb-8 border-b pb-6">
          <h2 className="lg:col-span-3 text-2xl font-semibold mb-4 text-gray-700">
            Informações da Venda
          </h2>
          <p>
            <strong>ID da Venda:</strong> {venda.id}
          </p>
          <p>
            <strong>Cliente:</strong> {venda.cliente?.nome || "N/A"}
          </p>
          <p>
            <strong>Data da Venda:</strong> {formattedDataVenda}
          </p>
          <p>
            <strong>Valor Total:</strong> {formattedValorTotal}
          </p>
          <p>
            <strong>Status Pagamento:</strong> {venda.statusPagamento}
          </p>
          <p className="md:col-span-2 lg:col-span-3">
            <strong>Observações:</strong> {venda.observacoes || "Nenhuma"}
          </p>
          <p>
            <strong>Criado em:</strong> {formattedCreatedAt}
          </p>
          <p>
            <strong>Última atualização:</strong> {formattedUpdatedAt}
          </p>
        </div>

        {/* Seção de Itens da Venda */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Itens da Venda
          </h2>
          {venda.itens.length === 0 ? (
            <p className="text-lg text-gray-600">
              Nenhum item registrado para esta venda.
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
                      Qtd.
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Preço Unit.
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {venda.itens.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        <Link
                          href={`/produtos/${item.produtoId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {item.produto?.nome || "Produto Desconhecido"}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {item.produto?.tipo || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {item.quantidade}
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        R$ {item.precoUnitario.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        R$ {item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Link href="/vendas">
          <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md shadow-sm mt-8">
            Voltar para a Lista de Vendas
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
