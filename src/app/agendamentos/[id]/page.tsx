// src/app/agendamentos/[id]/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react"; // Adicionado useCallback
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Para animações de carregamento/erro

// Interfaces (idealmente em um arquivo de tipos global)
interface ClienteSimples {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  cpf?: string;
}

interface Agendamento {
  id: string;
  clienteId: string;
  cliente?: ClienteSimples;
  dataAgendamento: string;
  horaAgendamento: string;
  tipoAgendamento: string;
  observacoes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AgendamentoDetailPage() {
  const { currentUser, loadingAuth } = useAuth(); // Removido userRole, pois não é usado diretamente aqui
  const router = useRouter();

  const { id } = useParams<{ id: string }>();
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar o agendamento (envolvida em useCallback)
  const fetchAgendamento = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/agendamentos/${id}`); // Busca agendamento pela API dinâmica
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      const data: Agendamento = await response.json();
      setAgendamento(data);
    } catch (err) {
      console.error("Falha ao buscar detalhes do agendamento:", err);
      setError("Não foi possível carregar os detalhes do agendamento.");
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
          fetchAgendamento(); // Chama a função useCallback
        } else {
          setLoading(false);
          setError("ID do agendamento não fornecido.");
        }
      }
    }
  }, [currentUser, loadingAuth, router, id, fetchAgendamento]); // Adicionado fetchAgendamento às dependências

  // Formatação de datas e horas
  const formattedDataAgendamento = agendamento?.dataAgendamento
    ? new Date(agendamento.dataAgendamento).toLocaleDateString("pt-BR")
    : "Não informado";
  const formattedCreatedAt = agendamento?.createdAt
    ? new Date(agendamento.createdAt).toLocaleString("pt-BR")
    : "Não informado";
  const formattedUpdatedAt = agendamento?.updatedAt
    ? new Date(agendamento.updatedAt).toLocaleString("pt-BR")
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
            Carregando Detalhes do Agendamento...
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
            Erro ao Carregar Agendamento
          </h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchAgendamento}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm"
          >
            Tentar Novamente
          </button>
        </motion.div>
      </div>
    );
  }

  if (!agendamento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-xl text-center"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Agendamento não encontrado
          </h1>
          <p className="text-gray-600">
            O agendamento com o ID especificado não foi encontrado.
          </p>
          <Link href="/agendamentos">
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm">
              Voltar para Agendamentos
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
          Detalhes do Agendamento
        </h1>

        {/* Informações do Agendamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-lg mb-8 border-b pb-6">
          <h2 className="lg:col-span-3 text-2xl font-semibold mb-4 text-gray-700">
            Informações do Agendamento
          </h2>
          <p>
            <strong>ID do Agendamento:</strong> {agendamento.id}
          </p>
          <p>
            <strong>Data:</strong> {formattedDataAgendamento}
          </p>
          <p>
            <strong>Hora:</strong> {agendamento.horaAgendamento}
          </p>
          <p>
            <strong>Tipo:</strong> {agendamento.tipoAgendamento}
          </p>
          <p>
            <strong>Status:</strong> {agendamento.status}
          </p>
          <p className="md:col-span-2 lg:col-span-3">
            <strong>Observações:</strong> {agendamento.observacoes || "Nenhuma"}
          </p>
          <p>
            <strong>Criado em:</strong> {formattedCreatedAt}
          </p>
          <p>
            <strong>Última atualização:</strong> {formattedUpdatedAt}
          </p>
        </div>

        {/* Seção de Detalhes do Cliente Associado */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Cliente Associado
          </h2>
          {agendamento.cliente ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
              <p>
                <strong>Nome:</strong> {agendamento.cliente.nome}
              </p>
              <p>
                <strong>Telefone:</strong>{" "}
                {agendamento.cliente.telefone || "Não informado"}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {agendamento.cliente.email || "Não informado"}
              </p>
              <p>
                <strong>CPF:</strong>{" "}
                {agendamento.cliente.cpf || "Não informado"}
              </p>
              <p className="md:col-span-2">
                <Link href={`/clientes/${agendamento.cliente.id}`}>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-sm mt-4">
                    Ver Detalhes do Cliente
                  </button>
                </Link>
              </p>
            </div>
          ) : (
            <p className="text-lg text-gray-600">
              Cliente não encontrado para este agendamento.
            </p>
          )}
        </div>

        <Link href="/agendamentos">
          <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md shadow-sm mt-8">
            Voltar para a Lista de Agendamentos
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
