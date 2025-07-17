// src/app/agendamentos/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import AgendamentoForm from "@/components/AgendamentoForm";
import AgendamentoTable from "@/components/AgendamentoTable";
import Notification from "@/components/Notification";
import { useAuth } from "@/context/AuthContext"; // Importe o useAuth
import { useRouter } from "next/navigation"; // Importe o useRouter

// Interfaces (idealmente em um arquivo de tipos global)
interface ClienteSimples {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
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

export default function AgendamentosPage() {
  const { currentUser, loadingAuth, userRole } = useAuth(); // Obtém o usuário, status de carregamento e papel
  const router = useRouter(); // Hook para redirecionamento

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<ClienteSimples[]>([]);
  const [loading, setLoading] = useState(true); // Estado de carregamento dos dados da página
  const [error, setError] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAgendamentoId, setEditingAgendamentoId] = useState<
    string | null
  >(null);
  const [agendamentoToEdit, setAgendamentoToEdit] =
    useState<Partial<Agendamento> | null>(null);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Função para buscar todos os agendamentos (envolvida em useCallback para otimização)
  const fetchAgendamentos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/agendamentos");
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      const data: Agendamento[] = await response.json();
      setAgendamentos(data);
    } catch (err) {
      console.error("Falha ao buscar agendamentos:", err);
      setError(
        "Não foi possível carregar os agendamentos. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  }, []); // Dependências vazias, pois setAgendamentos é estável

  // Função para buscar a lista de clientes (para o select do formulário) (envolvida em useCallback para otimização)
  const fetchClientesSimples = useCallback(async () => {
    try {
      const response = await fetch("/api/clientes");
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      const data: ClienteSimples[] = await response.json();
      setClientes(data);
    } catch (err) {
      console.error("Falha ao buscar clientes para o select:", err);
    }
  }, []); // Dependências vazias, pois setClientes é estável

  // --- LÓGICA DE PROTEÇÃO DE ROTA E CARREGAMENTO DE DADOS ---
  useEffect(() => {
    if (!loadingAuth) {
      // Só executa depois que o Firebase terminar de verificar o status de autenticação
      if (!currentUser) {
        // Se NÃO houver usuário logado, redireciona para a página de login
        router.push("/login");
      } else {
        // Se houver usuário logado, então pode buscar os dados da página
        fetchAgendamentos();
        fetchClientesSimples();
      }
    }
  }, [
    currentUser,
    loadingAuth,
    router,
    fetchAgendamentos,
    fetchClientesSimples,
  ]); // Dependências: reage a mudanças no usuário logado ou no status de carregamento da autenticação

  const handleSubmit = async (data: Partial<Agendamento>) => {
    setFormError(null);
    setIsSubmitting(true);

    if (
      !data.clienteId ||
      !data.dataAgendamento ||
      !data.horaAgendamento ||
      !data.tipoAgendamento
    ) {
      setFormError(
        "Cliente, Data, Hora e Tipo de Agendamento são obrigatórios."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const method = editingAgendamentoId ? "PATCH" : "POST";
      const url = editingAgendamentoId
        ? `/api/agendamentos/${editingAgendamentoId}`
        : "/api/agendamentos";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }

      await fetchAgendamentos();
      setAgendamentoToEdit(null);
      setEditingAgendamentoId(null);
      setNotification({
        message: `Agendamento ${
          editingAgendamentoId ? "atualizado" : "adicionado"
        } com sucesso!`,
        type: "success",
      });
    } catch (err: any) {
      console.error("Falha ao salvar agendamento:", err);
      setFormError(
        err.message || "Erro ao salvar agendamento. Tente novamente."
      );
      setNotification({
        message: err.message || "Erro ao salvar agendamento.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir este agendamento?`)) {
      return;
    }
    try {
      const response = await fetch(`/api/agendamentos/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      setNotification({
        message: `Agendamento excluído com sucesso!`,
        type: "success",
      });
      await fetchAgendamentos();
    } catch (err: any) {
      console.error("Falha ao excluir agendamento:", err);
      setNotification({
        message: err.message || "Erro ao excluir agendamento.",
        type: "error",
      });
    }
  };

  const handleEdit = (agendamento: Agendamento) => {
    setEditingAgendamentoId(agendamento.id);
    const formattedDate = agendamento.dataAgendamento
      ? new Date(agendamento.dataAgendamento).toISOString().split("T")[0]
      : "";
    setAgendamentoToEdit({ ...agendamento, dataAgendamento: formattedDate });
  };

  const handleCancelEdit = () => {
    setEditingAgendamentoId(null);
    setAgendamentoToEdit(null);
    setFormError(null);
  };

  const filteredAgendamentos = useMemo(() => {
    if (!searchTerm) {
      return agendamentos;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return agendamentos.filter(
      (agendamento) =>
        (agendamento.cliente?.nome &&
          agendamento.cliente.nome
            .toLowerCase()
            .includes(lowerCaseSearchTerm)) ||
        (agendamento.dataAgendamento &&
          agendamento.dataAgendamento.includes(lowerCaseSearchTerm)) ||
        (agendamento.horaAgendamento &&
          agendamento.horaAgendamento.includes(lowerCaseSearchTerm)) ||
        (agendamento.tipoAgendamento &&
          agendamento.tipoAgendamento
            .toLowerCase()
            .includes(lowerCaseSearchTerm)) ||
        (agendamento.status &&
          agendamento.status.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (agendamento.observacoes &&
          agendamento.observacoes.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [agendamentos, searchTerm]);

  // --- Renderização Condicional com base no status de autenticação e carregamento ---
  if (loadingAuth) {
    // Exibe uma tela de carregamento enquanto o Firebase verifica o status de autenticação
    return (
      <div className="container mx-auto p-8 text-center pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Carregando Autenticação...
        </h1>
        <p>Verificando seu status de login.</p>
      </div>
    );
  }

  if (!currentUser) {
    // Se NÃO houver usuário logado, o useEffect já redirecionou.
    // Retornamos null aqui para evitar renderizar o conteúdo da página por um instante.
    return null;
  }

  if (loading) {
    // Exibe uma tela de carregamento enquanto os dados da página estão sendo buscados (após autenticação)
    return (
      <div className="container mx-auto p-8 text-center pt-16">
        <h1 className="text-4xl mb-8 text-gray-800 md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg">
          Gestão de Agendamento
        </h1>
        <p>Carregando agendamentos...</p>
      </div>
    );
  }

  if (error) {
    // Exibe uma mensagem de erro se a busca de dados falhar
    return (
      <div className="container mx-auto p-8 text-center text-red-600 pt-16">
        <h1 className="text-4xl mb-8 text-gray-800 md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg">
          Gestão de Agendamentos
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  // Renderiza o conteúdo da página apenas se o usuário estiver logado e os dados carregados
  return (
    <div className="container mx-auto p-8 pt-16">
      <h1 className="text-4xl mb-15 text-gray-800 md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg">
        Gestão de Agendamentos
      </h1>

      <AgendamentoForm
        onSubmit={handleSubmit}
        initialData={agendamentoToEdit}
        onCancelEdit={handleCancelEdit}
        isSubmitting={isSubmitting}
        formError={formError}
        clientes={clientes}
      />

      <div className="mb-4">
        <input
          type="text"
          placeholder="Pesquisar agendamentos por cliente, data, hora, tipo ou status..."
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <AgendamentoTable
        agendamentos={filteredAgendamentos}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
