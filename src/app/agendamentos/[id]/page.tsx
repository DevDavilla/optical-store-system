// src/app/agendamentos/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // <-- Importe o useAuth
import { useRouter } from "next/navigation"; // <-- Importe o useRouter

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
  const { currentUser, loadingAuth, userRole } = useAuth(); // <-- Use o useAuth
  const router = useRouter(); // <-- Use o useRouter

  const { id } = useParams<{ id: string }>();
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- NOVIDADE AQUI: Proteção de rota e carregamento de dados ---
  useEffect(() => {
    if (!loadingAuth) {
      // Quando o status de autenticação termina de carregar
      if (!currentUser) {
        router.push("/login"); // Redireciona para login se não estiver autenticado
      } else {
        // Se estiver autenticado, busca os dados da página
        if (id) {
          // Garante que o ID existe antes de tentar buscar
          fetchAgendamento();
        } else {
          setLoading(false);
          setError("ID do agendamento não fornecido.");
        }
      }
    }
  }, [currentUser, loadingAuth, router, id]); // Dependências

  async function fetchAgendamento() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/agendamentos/${id}`);
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
  }

  // Formatação de datas e horas
  const formattedDataAgendamento = agendamento?.dataAgendamento
    ? new Date(agendamento.dataAgendamento).toLocaleDateString("pt-BR")
    : "Não informado";
  const formattedCreatedAt = new Date(agendamento.createdAt).toLocaleString(
    "pt-BR"
  );
  const formattedUpdatedAt = new Date(agendamento.updatedAt).toLocaleString(
    "pt-BR"
  );

  // --- NOVIDADE AQUI: Exibir tela de carregamento de autenticação ---
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

  // --- NOVIDADE AQUI: Exibir tela de acesso negado se não logado ---
  if (!currentUser) {
    return null; // O useEffect já redirecionou, então não renderiza nada aqui
  }

  // --- NOVIDADE AQUI: Exibir tela de carregamento de dados após autenticação ---
  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes do Agendamento
        </h1>
        <p>Carregando detalhes do agendamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-600 pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes do Agendamento
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!agendamento) {
    return (
      <div className="container mx-auto p-8 text-center pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes do Agendamento
        </h1>
        <p>Agendamento não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 pt-16">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
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
    </div>
  );
}
