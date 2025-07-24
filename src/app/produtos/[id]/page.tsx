// src/app/produtos/[id]/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react"; // Adicionado useCallback
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Importa motion para animações

// Definir os Enums como types para uso no frontend (copiados do ProdutoForm)
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

export default function ProdutoDetailPage() {
  const { currentUser, loadingAuth, userRole } = useAuth();
  const router = useRouter();

  const { id } = useParams<{ id: string }>();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar o produto (envolvida em useCallback)
  const fetchProduto = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/produtos/${id}`);
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      const data: Produto = await response.json();
      setProduto(data);
    } catch (err) {
      console.error("Falha ao buscar detalhes do produto:", err);
      setError("Não foi possível carregar os detalhes do produto.");
    } finally {
      setLoading(false);
    }
  }, [id]); // Depende de 'id' para refetch quando o ID da URL muda

  // Proteção de rota e carregamento de dados
  useEffect(() => {
    if (!loadingAuth) {
      if (!currentUser) {
        router.push("/login");
      } else if (userRole && userRole !== "admin") {
        // APENAS 'admin' pode acessar Produtos
        router.push("/");
      } else {
        if (id) {
          fetchProduto(); // Chama a função useCallback
        } else {
          setLoading(false);
          setError("ID do produto não fornecido.");
        }
      }
    }
  }, [currentUser, loadingAuth, userRole, router, id, fetchProduto]); // Adicionado fetchProduto às dependências

  // Formatação de datas e preços
  const formattedCreatedAt = produto?.createdAt
    ? new Date(produto.createdAt).toLocaleString("pt-BR")
    : "N/A";
  const formattedUpdatedAt = produto?.updatedAt
    ? new Date(produto.updatedAt).toLocaleString("pt-BR")
    : "N/A";
  const formattedPrecoCusto = produto?.precoCusto
    ? `R$ ${produto.precoCusto.toFixed(2)}`
    : "N/A";
  const formattedPrecoVenda = produto?.precoVenda
    ? `R$ ${produto.precoVenda.toFixed(2)}`
    : "N/A";

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
            Carregando Detalhes do Produto...
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
            Erro ao Carregar Produto
          </h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchProduto}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm"
          >
            Tentar Novamente
          </button>
        </motion.div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-xl text-center"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Produto não encontrado
          </h1>
          <p className="text-gray-600">
            O produto com o ID especificado não foi encontrado.
          </p>
          <Link href="/produtos">
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm">
              Voltar para Produtos
            </button>
          </Link>
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
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg mb-8">
          Detalhes do Produto: {produto.nome}
        </h1>

        {/* Informações Básicas do Produto */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-lg mb-8 border-b pb-6">
          <h2 className="lg:col-span-3 text-2xl font-semibold mb-4 text-gray-700">
            Informações Básicas
          </h2>
          <p>
            <strong>Nome:</strong> {produto.nome}
          </p>
          <p>
            <strong>Tipo:</strong> {produto.tipo}
          </p>
          <p>
            <strong>Marca:</strong> {produto.marca || "Não informado"}
          </p>
          <p>
            <strong>Modelo:</strong> {produto.modelo || "Não informado"}
          </p>
          <p>
            <strong>Quantidade em Estoque:</strong>{" "}
            {produto.quantidadeEmEstoque}
          </p>
          <p>
            <strong>Preço de Custo:</strong> {formattedPrecoCusto}
          </p>
          <p>
            <strong>Preço de Venda:</strong> {formattedPrecoVenda}
          </p>
          <p>
            <strong>Fornecedor:</strong> {produto.fornecedor || "Não informado"}
          </p>
          <p>
            <strong>SKU:</strong> {produto.sku || "Não informado"}
          </p>
          <p className="md:col-span-2 lg:col-span-3">
            <strong>Descrição:</strong> {produto.descricao || "Nenhuma"}
          </p>
          <p>
            <strong>Criado em:</strong> {formattedCreatedAt}
          </p>
          <p>
            <strong>Última atualização:</strong> {formattedUpdatedAt}
          </p>
        </div>

        {/* Campos Condicionais para Lente de Grau */}
        {produto.tipo === "LenteDeGrau" && (
          <div className="mt-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Detalhes da Lente de Grau
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
              <p>
                <strong>Tipo de Lente:</strong>{" "}
                {produto.tipoLenteGrau || "Não informado"}
              </p>
              <p>
                <strong>Material:</strong>{" "}
                {produto.materialLenteGrau || "Não informado"}
              </p>
              <p className="md:col-span-2">
                <strong>Tratamentos:</strong>{" "}
                {produto.tratamentosLenteGrau &&
                produto.tratamentosLenteGrau.length > 0
                  ? produto.tratamentosLenteGrau.join(", ")
                  : "Nenhum"}
              </p>

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-600 mb-2">
                    Olho Direito (OD)
                  </h3>
                  <p>
                    <strong>Esférico:</strong> {produto.grauEsfericoOD ?? "N/A"}
                  </p>
                  <p>
                    <strong>Cilíndrico:</strong>{" "}
                    {produto.grauCilindricoOD ?? "N/A"}
                  </p>
                  <p>
                    <strong>Eixo:</strong> {produto.grauEixoOD ?? "N/A"}
                  </p>
                  <p>
                    <strong>Adição:</strong> {produto.grauAdicaoOD ?? "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-600 mb-2">
                    Olho Esquerdo (OE)
                  </h3>
                  <p>
                    <strong>Esférico:</strong> {produto.grauEsfericoOE ?? "N/A"}
                  </p>
                  <p>
                    <strong>Cilíndrico:</strong>{" "}
                    {produto.grauCilindricoOE ?? "N/A"}
                  </p>
                  <p>
                    <strong>Eixo:</strong> {produto.grauEixoOE ?? "N/A"}
                  </p>
                  <p>
                    <strong>Adição:</strong> {produto.grauAdicaoOE ?? "N/A"}
                  </p>
                </div>
              </div>
              <p className="md:col-span-2">
                <strong>Fabricante/Laboratório:</strong>{" "}
                {produto.fabricanteLaboratorio || "Não informado"}
              </p>
            </div>
          </div>
        )}

        {/* Campos Condicionais para Lente de Contato */}
        {produto.tipo === "LenteDeContato" && (
          <div className="mt-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Detalhes da Lente de Contato
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
              <p>
                <strong>Curva Base:</strong>{" "}
                {produto.curvaBaseLenteContato || "Não informado"}
              </p>
              <p>
                <strong>Diâmetro:</strong>{" "}
                {produto.diametroLenteContato ?? "N/A"}
              </p>
              <p>
                <strong>Poder (Grau):</strong>{" "}
                {produto.poderLenteContato ?? "N/A"}
              </p>
              <p>
                <strong>Tipo de Descarte:</strong>{" "}
                {produto.tipoDescarteLenteContato || "Não informado"}
              </p>
              <p className="md:col-span-2">
                <strong>Soluções Compatíveis:</strong>{" "}
                {produto.solucoesLenteContato || "Não informado"}
              </p>
            </div>
          </div>
        )}

        {/* Campos Condicionais para Serviço */}
        {produto.tipo === "Servico" && (
          <div className="mt-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Detalhes do Serviço
            </h2>
            <p className="text-lg text-gray-600">
              Este item é um serviço. O preço de venda reflete o valor do
              serviço.
            </p>
          </div>
        )}

        <Link href="/produtos">
          <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md shadow-sm mt-8">
            Voltar para a Lista de Produtos
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
