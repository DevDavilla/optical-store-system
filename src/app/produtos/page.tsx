// src/app/produtos/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ProdutoForm from "@/components/ProdutoForm";
import ProdutoTable from "@/components/ProdutoTable";
import Notification from "@/components/Notification";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Importa motion para animações
import ConfirmationModal from "@/components/ConfirmationModal"; // Importa ConfirmationModal

// Interfaces (idealmente em um arquivo de tipos global)
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

  // --- NOVIDADE AQUI: Estado para o modal de confirmação ---
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string;
    nome: string;
    onConfirm: () => void;
  } | null>(null);

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
      if (!currentUser) {
        router.push("/login");
      } else if (userRole && userRole !== "admin") {
        // APENAS 'admin' pode acessar Produtos
        setNotification({
          message:
            "Acesso negado. Apenas administradores podem gerenciar produtos.",
          type: "error",
        });
        router.push("/");
      } else {
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

  // --- NOVIDADE AQUI: Lógica de exclusão com modal de confirmação ---
  const handleDelete = async (id: string, nome: string) => {
    setConfirmModal({
      isOpen: true,
      id: id,
      nome: nome,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/produtos/${id}`, {
            method: "DELETE",
          });
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
        } finally {
          setConfirmModal(null); // Fecha o modal após a ação
        }
      },
    });
  };

  const handleCancelDelete = () => {
    setConfirmModal(null); // Fecha o modal ao cancelar
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

  if (!currentUser || userRole !== "admin") {
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
            Carregando Produtos...
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
            Erro ao Carregar Produtos
          </h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchProdutos}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm"
          >
            Tentar Novamente
          </button>
        </motion.div>
      </div>
    );
  }

  // Renderiza o conteúdo da página apenas se o usuário for um admin logado e os dados carregados
  return (
    <motion.div
      className="container mx-auto p-8 pt-16"
      initial="hidden"
      animate="show"
      variants={pageVariants}
    >
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg mb-8">
        Controle de Estoque
      </h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-xl"
      >
        <ProdutoForm
          onSubmit={handleSubmit}
          initialData={produtoToEdit}
          onCancelEdit={handleCancelEdit}
          isSubmitting={isSubmitting}
          formError={formError}
        />

        <div className="my-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <input
            type="text"
            placeholder="Pesquisar produtos por nome, tipo, marca, SKU ou fornecedor..."
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ProdutoTable
          produtos={filteredProdutos}
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
          title={`Confirmar Exclusão de Produto`}
          message={`Tem certeza que deseja excluir o produto "${confirmModal.nome}"? Esta ação é irreversível.`}
          confirmText="Excluir"
          cancelText="Manter"
        />
      )}
    </motion.div>
  );
}
