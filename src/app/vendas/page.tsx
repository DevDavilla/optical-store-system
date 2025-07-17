// src/app/vendas/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import VendaForm from "@/components/VendaForm";
import VendaTable from "@/components/VendaTable";
import Notification from "@/components/Notification";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Interfaces (mantidas as mesmas)
interface ClienteSimples {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
}

interface ProdutoSimples {
  id: string;
  nome: string;
  precoVenda?: number;
  quantidadeEmEstoque: number;
}

interface ItemVenda {
  id?: string;
  produtoId: string;
  produto?: ProdutoSimples;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
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

export default function VendasPage() {
  const { currentUser, loadingAuth, userRole } = useAuth();
  const router = useRouter();

  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<ClienteSimples[]>([]);
  const [produtos, setProdutos] = useState<ProdutoSimples[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingVendaId, setEditingVendaId] = useState<string | null>(null);
  const [vendaToEdit, setVendaToEdit] = useState<Partial<Venda> | null>(null);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Função para buscar todas as vendas
  const fetchVendas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/vendas");
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      const data: Venda[] = await response.json();
      setVendas(data);
    } catch (err) {
      console.error("Falha ao buscar vendas:", err);
      setError(
        "Não foi possível carregar as vendas. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para buscar a lista de clientes (para o select do formulário)
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
  }, []);

  // Função para buscar a lista de produtos (para o select do formulário de itens)
  const fetchProdutosSimples = useCallback(async () => {
    try {
      const response = await fetch("/api/produtos");
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      const data: ProdutoSimples[] = await response.json();
      setProdutos(data);
    } catch (err) {
      console.error("Falha ao buscar produtos para o select:", err);
    }
  }, []);

  // --- LÓGICA DE PROTEÇÃO DE ROTA E CARREGAMENTO DE DADOS ---
  useEffect(() => {
    if (!loadingAuth) {
      if (!currentUser) {
        router.push("/login");
      } else {
        fetchVendas();
        fetchClientesSimples();
        fetchProdutosSimples();
      }
    }
  }, [
    currentUser,
    loadingAuth,
    router,
    fetchVendas,
    fetchClientesSimples,
    fetchProdutosSimples,
  ]);

  const handleSubmit = async (data: Partial<Venda>) => {
    setFormError(null);
    setIsSubmitting(true);

    if (!data.clienteId || !data.itens || data.itens.length === 0) {
      setFormError(
        "Cliente e pelo menos um item são obrigatórios para a venda."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const method = editingVendaId ? "PATCH" : "POST";
      const url = editingVendaId
        ? `/api/vendas/${editingVendaId}`
        : "/api/vendas";

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

      await fetchVendas();
      setVendaToEdit(null);
      setEditingVendaId(null);
      setNotification({
        message: `Venda ${
          editingVendaId ? "atualizada" : "registrada"
        } com sucesso!`,
        type: "success",
      });
    } catch (err: any) {
      console.error("Falha ao salvar venda:", err);
      setFormError(err.message || "Erro ao salvar venda. Tente novamente.");
      setNotification({
        message: err.message || "Erro ao salvar venda.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, valorTotal: number) => {
    if (
      !window.confirm(
        `Tem certeza que deseja excluir a venda de R$ ${valorTotal.toFixed(
          2
        )}? Isso reverterá o estoque dos produtos.`
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`/api/vendas/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Erro HTTP! Status: ${response.status}`
        );
      }
      setNotification({
        message: `Venda excluída com sucesso!`,
        type: "success",
      });
      await fetchVendas();
    } catch (err: any) {
      console.error("Falha ao excluir venda:", err);
      setNotification({
        message: err.message || "Erro ao excluir venda.",
        type: "error",
      });
    }
  };

  const handleEdit = (venda: Venda) => {
    setEditingVendaId(venda.id);
    setVendaToEdit({ ...venda });
  };

  const handleCancelEdit = () => {
    setEditingVendaId(null);
    setVendaToEdit(null);
    setFormError(null);
  };

  const filteredVendas = useMemo(() => {
    if (!searchTerm) {
      return vendas;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return vendas.filter(
      (venda) =>
        (venda.cliente?.nome &&
          venda.cliente.nome.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (venda.dataVenda &&
          new Date(venda.dataVenda)
            .toLocaleDateString("pt-BR")
            .includes(lowerCaseSearchTerm)) ||
        (venda.statusPagamento &&
          venda.statusPagamento.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (venda.observacoes &&
          venda.observacoes.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [vendas, searchTerm]);

  // --- Renderização Condicional com base no status de autenticação e carregamento ---
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

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Registro de Vendas
        </h1>
        <p>Carregando vendas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-600 pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Registro de Vendas
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 pt-16">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg mb-8">
        Registro de Vendas
      </h1>

      <VendaForm
        onSubmit={handleSubmit}
        initialData={vendaToEdit}
        onCancelEdit={handleCancelEdit}
        isSubmitting={isSubmitting}
        formError={formError}
        clientes={clientes}
        produtos={produtos}
      />

      <div className="mb-4">
        <input
          type="text"
          placeholder="Pesquisar vendas por cliente, data, status ou observações..."
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <VendaTable
        vendas={filteredVendas}
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
