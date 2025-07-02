// src/app/clientes/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ClientForm from "@/components/ClientForm";
import ClientTable from "@/components/ClientTable";

interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  cpf: string;
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
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    observacoes: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  async function fetchClientes() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/clientes");
      if (!response.ok)
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      const data: Cliente[] = await response.json();
      setClientes(data);
    } catch (err) {
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    if (!formData.nome) {
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
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Erro HTTP! Status: ${response.status}`
        );
      }

      await fetchClientes();
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        cpf: "",
        rg: "",
        dataNascimento: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
        observacoes: "",
      });
      setEditingClientId(null);
      alert(
        `Cliente ${editingClientId ? "atualizado" : "adicionado"} com sucesso!`
      );
    } catch (err: any) {
      setFormError(err.message || "Erro ao salvar cliente. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o cliente ${nome}?`))
      return;
    try {
      const response = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Erro HTTP! Status: ${response.status}`
        );
      }
      alert(`Cliente ${nome} excluído com sucesso!`);
      await fetchClientes();
    } catch (err: any) {
      alert(err.message || "Erro ao excluir cliente. Tente novamente.");
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingClientId(cliente.id);
    const formattedDate = cliente.dataNascimento
      ? new Date(cliente.dataNascimento).toISOString().split("T")[0]
      : "";
    setFormData({ ...cliente, dataNascimento: formattedDate });
  };

  const handleCancelEdit = () => {
    setEditingClientId(null);
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      rg: "",
      dataNascimento: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      observacoes: "",
    });
    setFormError(null);
  };

  if (loading)
    return <div className="p-8 text-center">Carregando clientes...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Gestão de Clientes
      </h1>

      <ClientForm
        formData={formData}
        formError={formError}
        isSubmitting={isSubmitting}
        editingClientId={editingClientId}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={handleCancelEdit}
      />

      <ClientTable
        clientes={clientes}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
