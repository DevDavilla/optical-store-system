// src/app/vendas/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Importe o useAuth
import { useRouter } from "next/navigation"; // Importe o useRouter

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
  const { currentUser, loadingAuth, userRole } = useAuth(); // Use o useAuth
  const router = useRouter(); // Use o useRouter

  const { id } = useParams<{ id: string }>();
  const [venda, setVenda] = useState<Venda | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Proteção de rota e carregamento de dados
  useEffect(() => {
    if (!loadingAuth) {
      // Quando o status de autenticação termina de carregar
      if (!currentUser) {
        router.push("/login"); // Redireciona para login se não estiver autenticado
      } else {
        // Se estiver autenticado, busca os dados da página
        if (id) {
          // Garante que o ID existe antes de tentar buscar
          fetchVenda();
        } else {
          setLoading(false);
          setError("ID da venda não fornecido.");
        }
      }
    }
  }, [currentUser, loadingAuth, router, id]); // Dependências

  async function fetchVenda() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/vendas/${id}`); // Busca venda pela API dinâmica
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

  // Formatação de datas e valores
  const formattedDataVenda = venda?.dataVenda
    ? new Date(venda.dataVenda).toLocaleDateString("pt-BR")
    : "N/A";
  const formattedValorTotal = `R$ ${venda?.valorTotal.toFixed(2) || "0.00"}`;
  const formattedCreatedAt = new Date(venda?.createdAt || "").toLocaleString(
    "pt-BR"
  );
  const formattedUpdatedAt = new Date(venda?.updatedAt || "").toLocaleString(
    "pt-BR"
  );

  // Exibir tela de carregamento de autenticação
  if (loadingAuth) {
    return (
      <div className="container mx-auto p-8 text-center pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Carregando Autenticação...
        </h1>
        <p>Verificando seu status de login.</p>
      </div>
    );
  }

  // Exibir tela de acesso negado se não logado
  if (!currentUser) {
    return null; // O useEffect já redirecionou, então não renderiza nada aqui
  }

  // Exibir tela de carregamento de dados após autenticação
  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes da Venda
        </h1>
        <p>Carregando detalhes da venda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-600 pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes da Venda
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!venda) {
    return (
      <div className="container mx-auto p-8 text-center pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes da Venda
        </h1>
        <p>Venda não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 pt-16">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
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
    </div>
  );
}
