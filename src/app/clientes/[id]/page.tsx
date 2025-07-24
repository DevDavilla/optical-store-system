// src/app/clientes/[id]/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Importa motion para animações

// Interface Receita (mantida aqui ou em um arquivo global de tipos)
interface Receita {
  id: string;
  dataReceita: string;
  odEsferico?: number;
  odCilindrico?: number;
  odEixo?: number;
  odAdicao?: number;
  oeEsferico?: number;
  oeCilindrico?: number;
  oeEixo?: number;
  oeAdicao?: number;
  distanciaPupilar?: number;
  distanciaNauseaPupilar?: number;
  alturaLente?: number;
  createdAt: string;
  updatedAt: string;
}

// Interface Cliente agora inclui 'receitas'
interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  receitas: Receita[]; // Array de receitas associadas
}

export default function ClienteDetailPage() {
  const { currentUser, loadingAuth, userRole } = useAuth();
  const router = useRouter();

  const { id } = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar o cliente (envolvida em useCallback)
  const fetchCliente = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/clientes/${id}`);
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      const data: Cliente = await response.json();
      setCliente(data);
    } catch (err) {
      console.error("Falha ao buscar detalhes do cliente:", err);
      setError("Não foi possível carregar os detalhes do cliente.");
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
          fetchCliente();
        } else {
          setLoading(false);
          setError("ID do cliente não fornecido.");
        }
      }
    }
  }, [currentUser, loadingAuth, router, id, fetchCliente]);

  // Converte a data de nascimento para um formato legível
  const formattedDataNascimento = cliente?.dataNascimento
    ? new Date(cliente.dataNascimento).toLocaleDateString("pt-BR")
    : "Não informado";

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
            Carregando Detalhes do Cliente...
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
            Erro ao Carregar Cliente
          </h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchCliente}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm"
          >
            Tentar Novamente
          </button>
        </motion.div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-xl text-center"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Cliente não encontrado
          </h1>
          <p className="text-gray-600">
            O cliente com o ID especificado não foi encontrado.
          </p>
          <Link href="/clientes">
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm">
              Voltar para Clientes
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
          Detalhes de {cliente.nome}
        </h1>

        {/* Informações Pessoais do Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-lg mb-8 border-b pb-6">
          <h2 className="lg:col-span-3 text-2xl font-semibold mb-4 text-gray-700">
            Informações Pessoais
          </h2>
          <p>
            <strong>Nome:</strong> {cliente.nome}
          </p>
          <p>
            <strong>Email:</strong> {cliente.email || "Não informado"}
          </p>
          <p>
            <strong>Telefone:</strong> {cliente.telefone || "Não informado"}
          </p>
          <p>
            <strong>CPF:</strong> {cliente.cpf || "Não informado"}
          </p>
          <p>
            <strong>RG:</strong> {cliente.rg || "Não informado"}
          </p>
          <p>
            <strong>Data de Nascimento:</strong> {formattedDataNascimento}
          </p>
          <p className="md:col-span-2 lg:col-span-3">
            <strong>Endereço:</strong> {cliente.endereco || "Não informado"}
          </p>
          <p>
            <strong>Cidade:</strong> {cliente.cidade || "Não informado"}
          </p>
          <p>
            <strong>Estado:</strong> {cliente.estado || "Não informado"}
          </p>
          <p>
            <strong>CEP:</strong> {cliente.cep || "Não informado"}
          </p>
          <p className="md:col-span-2 lg:col-span-3">
            <strong>Observações:</strong> {cliente.observacoes || "Nenhuma"}
          </p>
          <p>
            <strong>Criado em:</strong>{" "}
            {new Date(cliente.createdAt).toLocaleString("pt-BR")}
          </p>
          <p>
            <strong>Última atualização:</strong>{" "}
            {new Date(cliente.updatedAt).toLocaleString("pt-BR")}
          </p>
        </div>

        {/* Seção de Receitas do Cliente */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Receitas Associadas
          </h2>
          {cliente.receitas.length === 0 ? (
            <p className="text-lg text-gray-600">
              Nenhuma receita cadastrada para este cliente ainda.
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
                      OD Esférico
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      OE Esférico
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cliente.receitas.map((receita) => (
                    <tr key={receita.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {new Date(receita.dataReceita).toLocaleDateString(
                          "pt-BR"
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {receita.odEsferico ?? "N/A"}
                      </td>
                      <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                        {receita.oeEsferico ?? "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Link href={`/receitas/${receita.id}`}>
                          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs">
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

        {/* Botão de voltar para a lista de clientes */}
        <Link href="/clientes">
          <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md shadow-sm mt-8">
            Voltar para a Lista
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
