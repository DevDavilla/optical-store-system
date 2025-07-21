// src/app/cadastrar/page.tsx

"use client";

import { useState, useCallback, useEffect } from "react";
import CombinedClientRecipeForm from "@/components/CombinedClientRecipeForm";
import Notification from "@/components/Notification";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion"; // Importa motion para animações

// Interfaces (idealmente em um arquivo de tipos global)
interface Cliente {
  id?: string;
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
}

interface Receita {
  id?: string;
  clienteId: string;
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
}

interface ProdutoSimples {
  id: string;
  nome: string;
  precoVenda?: number;
  quantidadeEmEstoque: number;
  sku?: string;
}

interface ItemVendaForm {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
}

interface VendaFormPropsData {
  statusPagamento: string;
  observacoes?: string;
  itens: ItemVendaForm[];
  valorTotal: number;
}

export default function CadastrarPage() {
  const { currentUser, loadingAuth, userRole } = useAuth();
  const router = useRouter();

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [produtos, setProdutos] = useState<ProdutoSimples[]>([]);

  // Função para buscar produtos (para o select de itens da venda)
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

  // LÓGICA DE PROTEÇÃO DE ROTA E CARREGAMENTO DE DADOS
  useEffect(() => {
    if (!loadingAuth) {
      if (!currentUser) {
        router.push("/login");
      } else {
        fetchProdutosSimples();
      }
    }
  }, [currentUser, loadingAuth, router, fetchProdutosSimples]);

  const handleSubmit = async (data: {
    cliente: Partial<Cliente>;
    receita: Partial<Receita>;
    venda: Partial<VendaFormPropsData>;
  }) => {
    setFormError(null);
    setIsSubmitting(true);

    if (!data.cliente.nome || !data.cliente.cpf) {
      setFormError("Nome e CPF do cliente são obrigatórios.");
      setIsSubmitting(false);
      return;
    }
    if (!data.receita.dataReceita) {
      setFormError("Data da Receita é obrigatória.");
      setIsSubmitting(false);
      return;
    }
    if (data.venda.itens && data.venda.itens.length > 0) {
      if (!data.venda.statusPagamento) {
        setFormError(
          "Status de pagamento da venda é obrigatório se houver itens."
        );
        setIsSubmitting(false);
        return;
      }
    }

    try {
      let newClient: Cliente | null = null;
      let newRecipe: Receita | null = null;
      let newSaleId: string | null = null;

      // 1. Cadastrar o Cliente
      const clientResponse = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.cliente),
      });

      if (!clientResponse.ok) {
        const errorData = await clientResponse.json();
        throw new Error(
          errorData.message ||
            `Erro ao cadastrar cliente! Status: ${clientResponse.status}`
        );
      }
      newClient = await clientResponse.json();
      const newClientId = newClient.id;

      if (!newClientId) {
        throw new Error("ID do cliente não retornado após cadastro.");
      }

      // 2. Cadastrar a Receita, associando ao cliente recém-criado
      const recipeDataWithClientId = {
        ...data.receita,
        clienteId: newClientId,
      };
      const recipeResponse = await fetch("/api/receitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipeDataWithClientId),
      });

      if (!recipeResponse.ok) {
        const errorData = await recipeResponse.json();
        throw new Error(
          errorData.message ||
            `Erro ao cadastrar receita! Status: ${recipeResponse.status}`
        );
      }
      newRecipe = await recipeResponse.json();

      // 3. Cadastrar a Venda, se houver itens
      if (data.venda.itens && data.venda.itens.length > 0) {
        const saleDataWithClientId = { ...data.venda, clienteId: newClientId };
        const saleResponse = await fetch("/api/vendas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(saleDataWithClientId),
        });

        if (!saleResponse.ok) {
          const errorData = await saleResponse.json();
          throw new Error(
            errorData.message ||
              `Erro ao cadastrar venda! Status: ${saleResponse.status}`
          );
        }
        const newSale = await saleResponse.json();
        newSaleId = newSale.id;
      }

      setNotification({
        message: `Cliente "${newClient.nome}", Receita e Venda (se aplicável) cadastrados com sucesso!`,
        type: "success",
      });

      setTimeout(() => {
        router.push(`/clientes/${newClientId}`);
      }, 2000);
    } catch (err: any) {
      console.error("Falha ao cadastrar cliente, receita e venda:", err);
      setFormError(
        err.message ||
          "Erro ao cadastrar. Verifique os dados e tente novamente."
      );
      setNotification({
        message: err.message || "Erro ao cadastrar.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <motion.div
      className="container mx-auto p-8 pt-16"
      initial="hidden"
      animate="show"
      variants={pageVariants}
    >
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg mb-8">
        Cadastro Completo
      </h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-xl"
      >
        <CombinedClientRecipeForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          formError={formError}
          produtos={produtos}
        />
      </motion.div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </motion.div>
  );
}
