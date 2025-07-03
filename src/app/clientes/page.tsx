// src/app/clientes/page.tsx

"use client";

import { useState, useEffect, useMemo } from "react"; // Importe useMemo
import ClientForm from "@/components/ClientForm";
import ClientTable from "@/components/ClientTable";
import Notification from "@/components/Notification";

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
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Partial<Cliente> | null>(
    null
  );

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // --- NOVIDADE AQUI: Estado para o termo de pesquisa ---
  const [searchTerm, setSearchTerm] = useState("");

  async function fetchClientes() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/clientes");
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      const data: Cliente[] = await response.json();
      setClientes(data);
    } catch (err) {
      console.error("Falha ao buscar clientes:", err);
      setError(
        "Não foi possível carregar os clientes. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSubmit = async (data: Partial<Cliente>) => {
    setFormError(null);
    setIsSubmitting(true);

    if (!data.nome) {
      setFormError("O nome do cliente é obrigatório.");
      setIsSubmitting(false);
      return;
    }

    try {
      const method = editingClientId ? "PATCH" : "POST";
      const url = editingClientId
        ? `/api/clientes/${editingClientId}`
        : "/api/clientes";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Erro HTTP! Status: ${response.status}`
        );
      }

      await fetchClientes();
      setClientToEdit(null);
      setEditingClientId(null);
      setNotification({
        message: `Cliente ${
          editingClientId ? "atualizado" : "adicionado"
        } com sucesso!`,
        type: "success",
      });
    } catch (err: any) {
      console.error("Falha ao salvar cliente:", err);
      setFormError(err.message || "Erro ao salvar cliente. Tente novamente.");
      setNotification({
        message: err.message || "Erro ao salvar cliente.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o cliente ${nome}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Erro HTTP! Status: ${response.status}`
        );
      }

      setNotification({
        message: `Cliente ${nome} excluído com sucesso!`,
        type: "success",
      });
      await fetchClientes();
    } catch (err: any) {
      console.error("Falha ao excluir cliente:", err);
      setNotification({
        message: err.message || "Erro ao excluir cliente.",
        type: "error",
      });
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingClientId(cliente.id);
    const formattedDate = cliente.dataNascimento
      ? new Date(cliente.dataNascimento).toISOString().split("T")[0]
      : "";
    setClientToEdit({
      ...cliente,
      dataNascimento: formattedDate,
    });
  };

  const handleCancelEdit = () => {
    setEditingClientId(null);
    setClientToEdit(null);
    setFormError(null);
  };

  // --- NOVIDADE AQUI: Lógica de filtragem dos clientes ---
  const filteredClientes = useMemo(() => {
    if (!searchTerm) {
      return clientes; // Retorna todos os clientes se não houver termo de pesquisa
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(lowerCaseSearchTerm) ||
        (cliente.email &&
          cliente.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (cliente.cpf &&
          cliente.cpf.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (cliente.telefone &&
          cliente.telefone.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [clientes, searchTerm]); // Recalcula apenas quando 'clientes' ou 'searchTerm' mudam

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-center mb-8">
          Gestão de Clientes
        </h1>
        <p>Carregando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-600">
        <h1 className="text-4xl font-bold text-center mb-8">
          Gestão de Clientes
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Gestão de Clientes
      </h1>

      <ClientForm
        onSubmit={handleSubmit}
        initialData={clientToEdit}
        onCancelEdit={handleCancelEdit}
        isSubmitting={isSubmitting}
        formError={formError}
      />

      {/* --- NOVIDADE AQUI: Campo de pesquisa --- */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Pesquisar clientes por nome, email, CPF ou telefone..."
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ClientTable
        clientes={filteredClientes} // Passa a lista FILTRADA para a tabela
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
