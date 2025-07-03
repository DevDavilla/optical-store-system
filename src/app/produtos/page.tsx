// src/app/produtos/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react"; // Importe useMemo
import ProdutoForm from "@/components/ProdutoForm";
import ProdutoTable from "@/components/ProdutoTable";
import Notification from "@/components/Notification";

// Interfaces (idealmente em um arquivo de tipos global)
interface Produto {
  id: string;
  nome: string;
  tipo: string;
  marca?: string;
  modelo?: string;
  quantidadeEmEstoque: number;
  precoCusto?: number;
  precoVenda?: number;
  fornecedor?: string;
  descricao?: string;
  sku?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProdutoId, setEditingProdutoId] = useState<string | null>(null);
  const [produtoToEdit, setProdutoToEdit] = useState<Partial<Produto> | null>(
    null
  );

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // --- NOVIDADE AQUI: Estado para o termo de pesquisa ---
  const [searchTerm, setSearchTerm] = useState("");

  async function fetchProdutos() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/produtos");
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      const data: Produto[] = await response.json();
      setProdutos(data);
    } catch (err) {
      console.error("Falha ao buscar produtos:", err);
      setError(
        "Não foi possível carregar os produtos. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProdutos();
  }, []);

  const handleSubmit = async (data: Partial<Produto>) => {
    setFormError(null);
    setIsSubmitting(true);

    if (!data.nome || !data.tipo) {
      setFormError("Nome e Tipo do produto são obrigatórios.");
      setIsSubmitting(false);
      return;
    }

    try {
      const method = editingProdutoId ? "PATCH" : "POST";
      const url = editingProdutoId
        ? `/api/produtos/${editingProdutoId}`
        : "/api/produtos";

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

      await fetchProdutos(); // Recarrega a lista
      setProdutoToEdit(null); // Resetar formulário e modo de edição
      setEditingProdutoId(null);
      setNotification({
        message: `Produto ${
          editingProdutoId ? "atualizado" : "adicionado"
        } com sucesso!`,
        type: "success",
      });
    } catch (err: any) {
      console.error("Falha ao salvar produto:", err);
      setFormError(err.message || "Erro ao salvar produto. Tente novamente.");
      setNotification({
        message: err.message || "Erro ao salvar produto.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto ${nome}?`)) {
      return;
    }
    try {
      const response = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Erro HTTP! Status: ${response.status}`
        );
      }
      setNotification({
        message: `Produto ${nome} excluído com sucesso!`,
        type: "success",
      });
      await fetchProdutos();
    } catch (err: any) {
      console.error("Falha ao excluir produto:", err);
      setNotification({
        message: err.message || "Erro ao excluir produto.",
        type: "error",
      });
    }
  };

  const handleEdit = (produto: Produto) => {
    setEditingProdutoId(produto.id);
    setProdutoToEdit({ ...produto });
  };

  const handleCancelEdit = () => {
    setEditingProdutoId(null);
    setProdutoToEdit(null);
    setFormError(null);
  };

  // --- NOVIDADE AQUI: Lógica de filtragem dos produtos ---
  const filteredProdutos = useMemo(() => {
    if (!searchTerm) {
      return produtos;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return produtos.filter(
      (produto) =>
        produto.nome.toLowerCase().includes(lowerCaseSearchTerm) ||
        (produto.tipo &&
          produto.tipo.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (produto.marca &&
          produto.marca.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (produto.modelo &&
          produto.modelo.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (produto.sku &&
          produto.sku.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (produto.fornecedor &&
          produto.fornecedor.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (produto.descricao &&
          produto.descricao.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [produtos, searchTerm]);

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-center mb-8">
          Controle de Estoque
        </h1>
        <p>Carregando produtos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-600">
        <h1 className="text-4xl font-bold text-center mb-8">
          Controle de Estoque
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Controle de Estoque
      </h1>

      <ProdutoForm
        onSubmit={handleSubmit}
        initialData={produtoToEdit}
        onCancelEdit={handleCancelEdit}
        isSubmitting={isSubmitting}
        formError={formError}
      />

      {/* --- NOVIDADE AQUI: Campo de pesquisa --- */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Pesquisar produtos por nome, tipo, marca, SKU ou fornecedor..."
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ProdutoTable
        produtos={filteredProdutos} // Passa a lista FILTRADA
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
