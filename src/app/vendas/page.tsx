// src/app/vendas/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import VendaForm from "@/components/VendaForm";
import VendaTable from "@/components/VendaTable";
import Notification from "@/components/Notification";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ConfirmationModal from "@/components/ConfirmationModal";

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
  const { currentUser, loadingAuth } = useAuth();
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

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string;
    valorTotal: number;
    onConfirm: () => void;
  } | null>(null);

  const fetchVendas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/vendas");
      if (!response.ok)
        throw new Error(`Erro HTTP! Status: ${response.status}`);
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

  const fetchClientesSimples = useCallback(async () => {
    try {
      const response = await fetch("/api/clientes");
      if (!response.ok)
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      const data: ClienteSimples[] = await response.json();
      setClientes(data);
    } catch (err) {
      console.error("Falha ao buscar clientes para o select:", err);
    }
  }, []);

  const fetchProdutosSimples = useCallback(async () => {
    try {
      const response = await fetch("/api/produtos");
      if (!response.ok)
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      const data: ProdutoSimples[] = await response.json();
      setProdutos(data);
    } catch (err) {
      console.error("Falha ao buscar produtos para o select:", err);
    }
  }, []);

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
        method,
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
    } catch (err) {
      const error = err as Error;
      console.error("Falha ao salvar venda:", error);
      setFormError(error.message || "Erro ao salvar venda. Tente novamente.");
      setNotification({
        message: error.message || "Erro ao salvar venda.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, valorTotal: number) => {
    setConfirmModal({
      isOpen: true,
      id,
      valorTotal,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/vendas/${id}`, {
            method: "DELETE",
          });
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
        } catch (err) {
          const error = err as Error;
          console.error("Falha ao excluir venda:", error);
          setNotification({
            message: error.message || "Erro ao excluir venda.",
            type: "error",
          });
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  const handleCancelDelete = () => setConfirmModal(null);

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
    if (!searchTerm) return vendas;
    const lowerSearch = searchTerm.toLowerCase();
    return vendas.filter(
      (venda) =>
        venda.cliente?.nome?.toLowerCase().includes(lowerSearch) ||
        new Date(venda.dataVenda)
          .toLocaleDateString("pt-BR")
          .includes(lowerSearch) ||
        venda.statusPagamento?.toLowerCase().includes(lowerSearch) ||
        venda.observacoes?.toLowerCase().includes(lowerSearch)
    );
  }, [vendas, searchTerm]);

  const pageVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

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

  if (!currentUser) return null;

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
            Carregando Vendas...
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
            Erro ao Carregar Vendas
          </h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchVendas}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm"
          >
            Tentar Novamente
          </button>
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
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg mb-8">
        Registro de Vendas
      </h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-xl"
      >
        <VendaForm
          onSubmit={handleSubmit}
          initialData={vendaToEdit}
          onCancelEdit={handleCancelEdit}
          isSubmitting={isSubmitting}
          formError={formError}
          clientes={clientes}
          produtos={produtos}
        />

        <div className="my-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <input
            type="text"
            placeholder="Pesquisar vendas por cliente, data, status ou observações..."
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <VendaTable
          vendas={filteredVendas}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </motion.div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {confirmModal && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onConfirm={confirmModal.onConfirm}
          onCancel={handleCancelDelete}
          title="Confirmar Exclusão de Venda"
          message={`Tem certeza que deseja excluir a venda de R$ ${confirmModal.valorTotal.toFixed(
            2
          )}? Esta ação é irreversível e reverterá o estoque.`}
          confirmText="Excluir"
          cancelText="Manter"
        />
      )}
    </motion.div>
  );
}
