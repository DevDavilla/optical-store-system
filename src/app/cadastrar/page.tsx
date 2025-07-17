"use client";

import { useState, useCallback, useEffect } from "react";
import CombinedClientRecipeForm from "@/components/CombinedClientRecipeForm";
import Notification from "@/components/Notification";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Importe o useAuth

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
  const { currentUser, loadingAuth, userRole } = useAuth(); // Obtém o usuário, status de carregamento e papel
  const router = useRouter(); // Hook para redirecionamento

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [produtos, setProdutos] = useState<ProdutoSimples[]>([]); // Estado para produtos

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
  }, []); // Dependências vazias, pois setProdutos é estável

  // LÓGICA DE PROTEÇÃO DE ROTA E CARREGAMENTO DE DADOS
  useEffect(() => {
    if (!loadingAuth) {
      // Só executa depois que o Firebase terminar de verificar o status de autenticação
      if (!currentUser) {
        // Se NÃO houver usuário logado, redireciona para a página de login
        router.push("/login");
      } else {
        // Se houver usuário logado, então pode buscar os dados da página
        fetchProdutosSimples();
      }
    }
  }, [currentUser, loadingAuth, router, fetchProdutosSimples]); // Dependências: reage a mudanças no usuário logado ou no status de carregamento da autenticação

  const handleSubmit = async (data: {
    cliente: Partial<Cliente>;
    receita: Partial<Receita>;
    venda: Partial<VendaFormPropsData>;
  }) => {
    setFormError(null);
    setIsSubmitting(true);

    // Validações
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
    // Validação de venda: se há itens, a venda é obrigatória
    if (data.venda.itens && data.venda.itens.length > 0) {
      if (!data.venda.statusPagamento) {
        setFormError(
          "Status de pagamento da venda é obrigatório se houver itens."
        );
        setIsSubmitting(false);
        return;
      }
    } else {
      // Se não há itens na venda, garante que o valor total seja 0 para não enviar undefined
      data.venda.valorTotal = 0;
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

  // Renderização Condicional com base no status de autenticação e carregamento
  if (loadingAuth) {
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
    return null; // O useEffect já redirecionou, então não renderiza nada aqui
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-8 pt-16 font-sans">
      <h1 className="text-4xl mb-8 text-gray-800 md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg">
        Cadastro Completo
      </h1>
      <CombinedClientRecipeForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        formError={formError}
        setFormError={setFormError} // Passa a função setFormError para o componente filho
        produtos={produtos}
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
