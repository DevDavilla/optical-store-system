// src/app/agendamentos/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react"; // Importe useMemo
import AgendamentoForm from "@/components/AgendamentoForm";
import AgendamentoTable from "@/components/AgendamentoTable";
import Notification from "@/components/Notification";

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
  cliente?: ClienteSimples; // Pode ser incluído na busca
  dataAgendamento: string; // Formato YYYY-MM-DD
  horaAgendamento: string; // Formato HH:MM
  tipoAgendamento: string;
  observacoes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<ClienteSimples[]>([]);
  const [loading, setLoading] = useState(true);
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

  // --- NOVIDADE AQUI: Estado para o termo de pesquisa ---
  const [searchTerm, setSearchTerm] = useState("");

  async function fetchAgendamentos() {
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
  }

  async function fetchClientesSimples() {
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
  }

  useEffect(() => {
    fetchAgendamentos();
    fetchClientesSimples();
  }, []);

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
        throw new Error(
          errorData.message || `Erro HTTP! Status: ${response.status}`
        );
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
        throw new Error(
          errorData.message || `Erro HTTP! Status: ${response.status}`
        );
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

  // --- NOVIDADE AQUI: Lógica de filtragem dos agendamentos ---
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
            .includes(lowerCaseSearchTerm)) || // Busca por nome do cliente
        (agendamento.dataAgendamento &&
          agendamento.dataAgendamento.includes(lowerCaseSearchTerm)) || // Busca por data (string)
        (agendamento.horaAgendamento &&
          agendamento.horaAgendamento.includes(lowerCaseSearchTerm)) || // Busca por hora
        (agendamento.tipoAgendamento &&
          agendamento.tipoAgendamento
            .toLowerCase()
            .includes(lowerCaseSearchTerm)) || // Busca por tipo
        (agendamento.status &&
          agendamento.status.toLowerCase().includes(lowerCaseSearchTerm)) || // Busca por status
        (agendamento.observacoes &&
          agendamento.observacoes.toLowerCase().includes(lowerCaseSearchTerm)) // Busca por observações
    );
  }, [agendamentos, searchTerm]);

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-center mb-8">
          Gestão de Agendamentos
        </h1>
        <p>Carregando agendamentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-600">
        <h1 className="text-4xl font-bold text-center mb-8">
          Gestão de Agendamentos
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
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

      {/* --- NOVIDADE AQUI: Campo de pesquisa --- */}
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
        agendamentos={filteredAgendamentos} // Passa a lista FILTRADA
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
