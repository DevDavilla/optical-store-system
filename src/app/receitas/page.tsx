// src/app/receitas/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react"; // Importe useMemo
import ReceitaForm from "@/components/ReceitaForm";
import ReceitaTable from "@/components/ReceitaTable";
import Notification from "@/components/Notification";

// Interfaces (idealmente em um arquivo de tipos global)
interface ClienteSimples {
  id: string;
  nome: string;
}

interface Receita {
  id: string;
  clienteId: string;
  cliente?: ClienteSimples; // Pode ser incluído na busca
  dataReceita: string;
  observacoes?: string;
  odEsferico?: number;
  odCilindrico?: number;
  odEixo?: number;
  odAdicao?: number;
  oeEsferico?: number;
  oeCilindrico?: number;
  oeEixo?: number;
  oeAdicao?: number;
  distanciaPupilar?: number;
  createdAt: string;
  updatedAt: string;
}

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [clientes, setClientes] = useState<ClienteSimples[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReceitaId, setEditingReceitaId] = useState<string | null>(null);
  const [receitaToEdit, setReceitaToEdit] = useState<Partial<Receita> | null>(
    null
  );

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // --- NOVIDADE AQUI: Estado para o termo de pesquisa ---
  const [searchTerm, setSearchTerm] = useState("");

  async function fetchReceitas() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/receitas");
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      const data: Receita[] = await response.json();
      setReceitas(data);
    } catch (err) {
      console.error("Falha ao buscar receitas:", err);
      setError(
        "Não foi possível carregar as receitas. Tente novamente mais tarde."
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
    fetchReceitas();
    fetchClientesSimples();
  }, []);

  const handleSubmit = async (data: Partial<Receita>) => {
    setFormError(null);
    setIsSubmitting(true);

    if (!data.clienteId || !data.dataReceita) {
      setFormError("Cliente e Data da Receita são obrigatórios.");
      setIsSubmitting(false);
      return;
    }

    try {
      const method = editingReceitaId ? "PATCH" : "POST";
      const url = editingReceitaId
        ? `/api/receitas/${editingReceitaId}`
        : "/api/receitas";

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

      await fetchReceitas(); // Recarrega a lista
      setReceitaToEdit(null); // Resetar formulário e modo de edição
      setEditingReceitaId(null);
      setNotification({
        message: `Receita ${
          editingReceitaId ? "atualizada" : "adicionada"
        } com sucesso!`,
        type: "success",
      });
    } catch (err: any) {
      console.error("Falha ao salvar receita:", err);
      setFormError(err.message || "Erro ao salvar receita. Tente novamente.");
      setNotification({
        message: err.message || "Erro ao salvar receita.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir esta receita?`)) {
      return;
    }
    try {
      const response = await fetch(`/api/receitas/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Erro HTTP! Status: ${response.status}`
        );
      }
      setNotification({
        message: `Receita excluída com sucesso!`,
        type: "success",
      });
      await fetchReceitas();
    } catch (err: any) {
      console.error("Falha ao excluir receita:", err);
      setNotification({
        message: err.message || "Erro ao excluir receita.",
        type: "error",
      });
    }
  };

  const handleEdit = (receita: Receita) => {
    setEditingReceitaId(receita.id);
    const formattedDate = receita.dataReceita
      ? new Date(receita.dataReceita).toISOString().split("T")[0]
      : "";
    setReceitaToEdit({ ...receita, dataReceita: formattedDate });
  };

  const handleCancelEdit = () => {
    setEditingReceitaId(null);
    setReceitaToEdit(null);
    setFormError(null);
  };

  // --- NOVIDADE AQUI: Lógica de filtragem das receitas ---
  const filteredReceitas = useMemo(() => {
    if (!searchTerm) {
      return receitas;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return receitas.filter(
      (receita) =>
        (receita.cliente?.nome &&
          receita.cliente.nome.toLowerCase().includes(lowerCaseSearchTerm)) || // Busca por nome do cliente
        (receita.dataReceita &&
          receita.dataReceita.includes(lowerCaseSearchTerm)) || // Busca por data (string)
        (receita.observacoes &&
          receita.observacoes.toLowerCase().includes(lowerCaseSearchTerm)) || // Busca por observações
        (receita.odEsferico !== undefined &&
          receita.odEsferico.toString().includes(lowerCaseSearchTerm)) || // Busca por grau OD
        (receita.oeEsferico !== undefined &&
          receita.oeEsferico.toString().includes(lowerCaseSearchTerm)) // Busca por grau OE
    );
  }, [receitas, searchTerm]);

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-center mb-8">
          Gestão de Receitas
        </h1>
        <p>Carregando receitas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-600">
        <h1 className="text-4xl font-bold text-center mb-8">
          Gestão de Receitas
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Gestão de Receitas
      </h1>

      <ReceitaForm
        onSubmit={handleSubmit}
        initialData={receitaToEdit}
        onCancelEdit={handleCancelEdit}
        isSubmitting={isSubmitting}
        formError={formError}
        clientes={clientes}
      />

      {/* --- NOVIDADE AQUI: Campo de pesquisa --- */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Pesquisar receitas por cliente, data, observações ou graus..."
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ReceitaTable
        receitas={filteredReceitas} // Passa a lista FILTRADA
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
