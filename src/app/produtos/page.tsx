"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ProdutoForm from "@/components/ProdutoForm";
import ProdutoTable from "@/components/ProdutoTable";
import Notification from "@/components/Notification";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Definir os Enums como types para uso no frontend
type TipoProdutoEnum =
  | "Armacao"
  | "LenteDeGrau"
  | "LenteDeContato"
  | "Acessorio"
  | "Servico"
  | "Outro";
type TipoLenteGrauEnum =
  | "VisaoSimples"
  | "Multifocal"
  | "Bifocal"
  | "Ocupacional"
  | "Progressiva"
  | "Outro";
type MaterialLenteGrauEnum =
  | "Resina"
  | "Policarbonato"
  | "Cristal"
  | "Trivex"
  | "Outro";
type TipoDescarteLenteContatoEnum =
  | "Diario"
  | "Quinzenal"
  | "Mensal"
  | "Trimestral"
  | "Anual"
  | "Outro";

interface Produto {
  id: string;
  nome: string;
  tipo: TipoProdutoEnum;
  marca?: string;
  modelo?: string;
  quantidadeEmEstoque: number;
  precoCusto?: number;
  precoVenda?: number;
  fornecedor?: string;
  descricao?: string;
  sku?: string;

  tipoLenteGrau?: TipoLenteGrauEnum;
  materialLenteGrau?: MaterialLenteGrauEnum;
  tratamentosLenteGrau?: string[];
  grauEsfericoOD?: number;
  grauCilindricoOD?: number;
  grauEixoOD?: number;
  grauAdicaoOD?: number;
  grauEsfericoOE?: number;
  grauCilindricoOE?: number;
  grauEixoOE?: number;
  grauAdicaoOE?: number;
  fabricanteLaboratorio?: string;

  curvaBaseLenteContato?: string;
  diametroLenteContato?: number;
  poderLenteContato?: number;
  tipoDescarteLenteContato?: TipoDescarteLenteContatoEnum;
  solucoesLenteContato?: string;

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

export default function ProdutosPage() {
  const { currentUser, loadingAuth, userRole } = useAuth();
  const router = useRouter();

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

  const [searchTerm, setSearchTerm] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  // Função para buscar todos os produtos
  const fetchProdutos = useCallback(async () => {
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
  }, []);

  // --- LÓGICA DE PROTEÇÃO DE ROTA POR PAPEL ---
  useEffect(() => {
    if (!loadingAuth) {
      // Só executa depois que o Firebase terminar de verificar o status de autenticação
      if (!currentUser) {
        // Se NÃO houver usuário logado, redireciona para a página de login
        router.push("/login");
      } else if (userRole && userRole !== "admin") {
        // Se houver usuário logado, mas o papel NÃO for 'admin', redireciona para a página inicial
        setNotification({
          message:
            "Acesso negado. Apenas administradores podem gerenciar produtos.",
          type: "error",
        });
        router.push("/");
      } else {
        // Se for admin logado, então pode buscar os dados da página
        fetchProdutos();
      }
    }
  }, [currentUser, loadingAuth, userRole, router, fetchProdutos]);

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

      await fetchProdutos();
      setProdutoToEdit(null);
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

  const handleDeleteClick = (id: string, nome: string) => {
    setProdutoToDelete({ id, nome });
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!produtoToDelete) return;

    setShowConfirmModal(false); // Fecha o modal
    try {
      const response = await fetch(`/api/produtos/${produtoToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Erro HTTP! Status: ${response.status}`
        );
      }
      setNotification({
        message: `Produto ${produtoToDelete.nome} excluído com sucesso!`,
        type: "success",
      });
      await fetchProdutos();
    } catch (err: any) {
      console.error("Falha ao excluir produto:", err);
      setNotification({
        message: err.message || "Erro ao excluir produto.",
        type: "error",
      });
    } finally {
      setProdutoToDelete(null); // Limpa o produto a ser excluído
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setProdutoToDelete(null);
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

  // --- Renderização Condicional com base no status de autenticação e papel ---
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 pt-16 font-sans">
        <h1 className="text-4xl font-bold text-center mb-8">
          Carregando Autenticação...
        </h1>
        <p>Verificando seu status de login e permissões.</p>
      </div>
    );
  }

  // Se não estiver logado OU o papel NÃO for 'admin', o useEffect já redirecionou.
  // Retornamos null para evitar renderizar o conteúdo da página por um instante.
  if (!currentUser || userRole !== "admin") {
    return null;
  }

  // Exibir tela de carregamento de dados após autenticação e permissão
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 pt-16 font-sans">
        <h1 className="text-4xl font-bold text-center mb-8">
          Controle de Estoque
        </h1>
        <p>Carregando produtos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 pt-16 text-red-600 font-sans">
        <h1 className="text-4xl font-bold text-center mb-8">
          Controle de Estoque
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  // Renderiza o conteúdo da página apenas se o usuário for um admin logado e os dados carregados
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-8 pt-16 font-sans">
      <h1 className="text-4xl mb-8 md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg">
        Controle de Estoque
      </h1>

      <ProdutoForm
        onSubmit={handleSubmit}
        initialData={produtoToEdit}
        onCancelEdit={handleCancelEdit}
        isSubmitting={isSubmitting}
        formError={formError}
      />

      <div className="mb-8 p-4 bg-white rounded-xl shadow-md border border-gray-200">
        {" "}
        {/* Estilizado o container da busca */}
        <input
          type="text"
          placeholder="Pesquisar produtos por nome, tipo, marca, SKU ou fornecedor..."
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700" // Estilizado o input de busca
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ProdutoTable
        produtos={filteredProdutos}
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

      {showConfirmModal && produtoToDelete && (
        <ConfirmationModal
          message={`Tem certeza que deseja excluir o produto "${produtoToDelete.nome}"? Esta ação é irreversível.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
