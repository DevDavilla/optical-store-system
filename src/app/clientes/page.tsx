// src/app/clientes/page.tsx

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ClientForm from "@/components/ClientForm"; // Importa o ClientForm
import ClientTable from "@/components/ClientTable";
import Notification from "@/components/Notification";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Importa motion para animações
import ConfirmationModal from "@/components/ConfirmationModal";

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
  const { currentUser, loadingAuth, userRole } = useAuth();
  const router = useRouter();

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
  const [searchTerm, setSearchTerm] = useState("");

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string;
    nome: string;
    onConfirm: () => void;
  } | null>(null);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/clientes");
      if (!response.ok)
        throw new Error(`Erro HTTP! Status: ${response.status}`);
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
  }, []);

  useEffect(() => {
    if (!loadingAuth) {
      if (!currentUser) {
        router.push("/login");
      } else {
        fetchClientes();
      }
    }
  }, [currentUser, loadingAuth, router, fetchClientes]);

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
    setConfirmModal({
      isOpen: true,
      id: id,
      nome: nome,
      onConfirm: async () => {
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
        } finally {
          setConfirmModal(null); // Fecha o modal após a ação
        }
      },
    });
  };

  const handleCancelDelete = () => {
    setConfirmModal(null); // Fecha o modal ao cancelar
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingClientId(cliente.id);
    const formattedDate = cliente.dataNascimento
      ? new Date(cliente.dataNascimento).toISOString().split("T")[0]
      : "";
    setClientToEdit({ ...cliente, dataNascimento: formattedDate });
  };

  const handleCancelEdit = () => {
    setEditingClientId(null);
    setClientToEdit(null);
    setFormError(null);
  };

  const filteredClientes = useMemo(() => {
    if (!searchTerm) return clientes;
    const lower = searchTerm.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(lower) ||
        c.email?.toLowerCase().includes(lower) ||
        c.cpf?.toLowerCase().includes(lower) ||
        c.telefone?.toLowerCase().includes(lower)
    );
  }, [clientes, searchTerm]);

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
          <p className="text-gray-600">
            Verificando seu status de login e permissões.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // O useEffect já redirecionou, então não renderiza nada aqui
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
            Carregando Clientes...
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
            Erro ao Carregar Clientes
          </h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchClientes}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm"
          >
            Tentar Novamente
          </button>
        </motion.div>
      </div>
    );
  }

  // Renderiza o conteúdo da página apenas se o usuário estiver logado e os dados carregados
  return (
    <motion.div
      className="container mx-auto p-8 pt-16" // Removido fundo aqui, pois está no layout.tsx
      initial="hidden"
      animate="show"
      variants={pageVariants} // Aplica a animação de entrada
    >
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg mb-8">
        Gestão de Clientes
      </h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-xl" // Contêiner principal do conteúdo
      >
        <ClientForm
          onSubmit={handleSubmit}
          initialData={clientToEdit}
          onCancelEdit={handleCancelEdit}
          isSubmitting={isSubmitting}
          formError={formError}
        />

        <div className="my-6">
          {" "}
          {/* Ajustado para my-6 para espaçamento consistente */}
          <input
            type="text"
            placeholder="Pesquisar clientes por nome, email, CPF ou telefone..."
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" // Ajustado p-3
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ClientTable
          clientes={filteredClientes}
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
          title={`Confirmar Exclusão de Cliente`}
          message={`Tem certeza que deseja excluir o cliente "${confirmModal.nome}"? Esta ação é irreversível.`}
          confirmText="Excluir"
          cancelText="Manter"
        />
      )}
    </motion.div>
  );
}
