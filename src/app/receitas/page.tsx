"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ReceitaForm from "@/components/ReceitaForm";
import ReceitaTable from "@/components/ReceitaTable";
import Notification from "@/components/Notification";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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

// Componente de Modal de Confirmação
interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-sans">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <p className="text-lg font-semibold mb-4 text-gray-800">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

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

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [receitaToDelete, setReceitaToDelete] = useState<string | null>(null);

  // Função para buscar todas as receitas (envolvida em useCallback para otimização)
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
  }, []); // Dependências vazias, pois setReceitas é estável

  // Função para buscar a lista de clientes (para o select do formulário) (envolvida em useCallback para otimização)
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
  }, []); // Dependências vazias, pois setClientes é estável

  // --- LÓGICA DE PROTEÇÃO DE ROTA E CARREGAMENTO DE DADOS ---
  useEffect(() => {
    if (!loadingAuth) {
      // Só executa depois que o Firebase terminar de verificar o status de autenticação
      if (!currentUser) {
        // Se NÃO houver usuário logado, redireciona para a página de login
        router.push("/login");
      } else {
        // Se houver usuário logado, então pode buscar os dados da página
        fetchReceitas();
        fetchClientesSimples();
      }
    }
  }, [currentUser, loadingAuth, router, fetchReceitas, fetchClientesSimples]); // Dependências: reage a mudanças no usuário logado ou no status de carregamento da autenticação

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

  const handleDeleteClick = (id: string) => {
    setReceitaToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!receitaToDelete) return;

    setShowConfirmModal(false); // Fecha o modal
    try {
      const response = await fetch(`/api/receitas/${receitaToDelete}`, {
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
      setReceitaToDelete(null); // Limpa a receita a ser excluída
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setReceitaToDelete(null);
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
    if (!searchTerm) {
      return receitas;
    }
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

  // --- Renderização Condicional com base no status de autenticação e carregamento ---
  if (loadingAuth) {
    // Exibe uma tela de carregamento enquanto o Firebase verifica o status de autenticação
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 pt-16 font-sans">
        <h1 className="text-4xl font-bold text-center mb-8">
          Carregando Autenticação...
        </h1>
        <p>Verificando seu status de login.</p>
      </div>
    );
  }

  if (!currentUser) {
    // Se NÃO houver usuário logado, o useEffect já redirecionou.
    // Retornamos null aqui para evitar renderizar o conteúdo da página por um instante.
    return null;
  }

  if (loading) {
    // Exibe uma tela de carregamento enquanto os dados da página estão sendo buscados (após autenticação)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 pt-16 font-sans">
        <h1 className="text-4xl font-bold text-center mb-8">
          Gestão de Receitas
        </h1>
        <p>Carregando receitas...</p>
      </div>
    );
  }

  if (error) {
    // Exibe uma mensagem de erro se a busca de dados falhar
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 pt-16 text-red-600 font-sans">
        <h1 className="text-4xl font-bold text-center mb-8">
          Gestão de Receitas
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  // Renderiza o conteúdo da página apenas se o usuário estiver logado e os dados carregados
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-8 pt-16 font-sans">
      <h1 className="text-4xl mb-8 md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg">
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

      <div className="mb-8 p-4 bg-white rounded-xl shadow-md border border-gray-200">
        <input
          type="text"
          placeholder="Pesquisar receitas por cliente, data, observações ou graus..."
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ReceitaTable
        receitas={filteredReceitas}
        onEdit={handleEdit}
        onDelete={handleDeleteClick} // Alterado para usar o novo handler
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {showConfirmModal && receitaToDelete && (
        <ConfirmationModal
          message={`Tem certeza que deseja excluir esta receita? Esta ação é irreversível.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
