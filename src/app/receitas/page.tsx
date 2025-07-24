"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ReceitaForm from "@/components/ReceitaForm";
import ReceitaTable from "@/components/ReceitaTable";
import Notification from "@/components/Notification";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Importa motion para animações
import ConfirmationModal from "@/components/ConfirmationModal"; // Importa ConfirmationModal

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
  distanciaNauseaPupilar?: number;
  alturaLente?: number;
  createdAt: string;
  updatedAt: string;
}

export default function ReceitasPage() {
  const { currentUser, loadingAuth, userRole } = useAuth();
  const router = useRouter();

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

  const [searchTerm, setSearchTerm] = useState("");

  // Corrigido: Adicionado `nome` ao estado confirmModal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string;
    nome: string;
    onConfirm: () => void;
  } | null>(null);

  const fetchReceitas = useCallback(async () => {
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
  }, []);

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

  useEffect(() => {
    if (!loadingAuth) {
      if (!currentUser) {
        router.push("/login");
      } else {
        fetchReceitas();
        fetchClientesSimples();
      }
    }
  }, [currentUser, loadingAuth, router, fetchReceitas, fetchClientesSimples]);

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

      await fetchReceitas();
      setReceitaToEdit(null);
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
    setConfirmModal({
      isOpen: true,
      id,
      nome: `Receita ${id.substring(0, 8)}...`, // Identificador para mostrar no modal
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/receitas/${id}`, {
            method: "DELETE",
          });
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
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  const handleCancelDelete = () => {
    setConfirmModal(null);
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

  const filteredReceitas = useMemo(() => {
    if (!searchTerm) return receitas;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return receitas.filter(
      (receita) =>
        (receita.cliente?.nome &&
          receita.cliente.nome.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (receita.dataReceita &&
          receita.dataReceita.includes(lowerCaseSearchTerm)) ||
        (receita.observacoes &&
          receita.observacoes.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (receita.odEsferico !== undefined &&
          receita.odEsferico.toString().includes(lowerCaseSearchTerm)) ||
        (receita.oeEsferico !== undefined &&
          receita.oeEsferico.toString().includes(lowerCaseSearchTerm))
    );
  }, [receitas, searchTerm]);

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
            Carregando Receitas...
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
            Erro ao Carregar Receitas
          </h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchReceitas}
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
        Gestão de Receitas
      </h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-xl"
      >
        <ReceitaForm
          onSubmit={handleSubmit}
          initialData={receitaToEdit}
          onCancelEdit={handleCancelEdit}
          isSubmitting={isSubmitting}
          formError={formError}
          clientes={clientes}
        />

        <div className="my-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <input
            type="text"
            placeholder="Pesquisar receitas por cliente, data, observações ou graus..."
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ReceitaTable
          receitas={filteredReceitas}
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
          title={`Confirmar Exclusão de Receita`}
          message={`Tem certeza que deseja excluir a ${confirmModal.nome}? Esta ação é irreversível.`}
          confirmText="Excluir"
          cancelText="Manter"
        />
      )}
    </motion.div>
  );
}
