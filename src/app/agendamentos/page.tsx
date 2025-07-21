// src/app/agendamentos/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import AgendamentoForm from "@/components/AgendamentoForm";
import AgendamentoTable from "@/components/AgendamentoTable";
import Notification from "@/components/Notification";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Importa motion para animações
import ConfirmationModal from "@/components/ConfirmationModal"; // Importa ConfirmationModal

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
  const { currentUser, loadingAuth, userRole } = useAuth();
  const router = useRouter();

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

  const [searchTerm, setSearchTerm] = useState("");

  // --- NOVIDADE AQUI: Estado para o modal de confirmação ---
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string;
    // nome: string; // Agendamento não tem nome direto, podemos usar tipo/data
    onConfirm: () => void;
  } | null>(null);

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
  ]);

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

  // --- NOVIDADE AQUI: Lógica de exclusão com modal de confirmação ---
  const handleDelete = async (id: string) => {
    const agendamentoParaExcluir = agendamentos.find((a) => a.id === id);
    const identificador = agendamentoParaExcluir
      ? `${agendamentoParaExcluir.tipoAgendamento} em ${new Date(
          agendamentoParaExcluir.dataAgendamento
        ).toLocaleDateString("pt-BR")}`
      : `Agendamento ${id.substring(0, 8)}...`;

    setConfirmModal({
      isOpen: true,
      id: id,
      nome: identificador, // Usando o identificador no modal
      onConfirm: async () => {
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
        } finally {
          setConfirmModal(null); // Fecha o modal após a ação
        }
      },
    });
  };

  const handleCancelDelete = () => {
    setConfirmModal(null); // Fecha o modal ao cancelar
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
          <p className="text-gray-600">Verificando seu status de login.</p>
        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
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
            Carregando Agendamentos...
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
            Erro ao Carregar Agendamentos
          </h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchAgendamentos}
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
      className="container mx-auto p-8 pt-16"
      initial="hidden"
      animate="show"
      variants={pageVariants}
    >
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg mb-8">
        Gestão de Agendamentos
      </h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-xl"
      >
        <AgendamentoForm
          onSubmit={handleSubmit}
          initialData={agendamentoToEdit}
          onCancelEdit={handleCancelEdit}
          isSubmitting={isSubmitting}
          formError={formError}
          clientes={clientes}
        />

        <div className="my-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <input
            type="text"
            placeholder="Pesquisar agendamentos por cliente, data, hora, tipo ou status..."
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <AgendamentoTable
          agendamentos={filteredAgendamentos}
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
          title={`Confirmar Exclusão de Agendamento`}
          message={`Tem certeza que deseja excluir o ${confirmModal.nome}? Esta ação é irreversível.`}
          confirmText="Excluir"
          cancelText="Manter"
        />
      )}
    </motion.div>
  );
}
