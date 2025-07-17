// src/app/produtos/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // <-- Importe o useAuth
import { useRouter } from "next/navigation"; // <-- Importe o useRouter

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

  // Campos específicos para Lente de Grau
  tipoLenteGrau?: TipoLenteGrauEnum;
  materialLenteGrau?: MaterialLenteGrauEnum;
  tratamentosLenteGrau?: string[]; // Array de strings
  grauEsfericoOD?: number;
  grauCilindricoOD?: number;
  grauEixoOD?: number;
  grauAdicaoOD?: number;
  grauEsfericoOE?: number;
  grauCilindricoOE?: number;
  grauEixoOE?: number;
  grauAdicaoOE?: number;
  fabricanteLaboratorio?: string;

  // Campos específicos para Lente de Contato
  curvaBaseLenteContato?: string;
  diametroLenteContato?: number;
  poderLenteContato?: number;
  tipoDescarteLenteContato?: TipoDescarteLenteContatoEnum;
  solucoesLenteContato?: string;

  createdAt: string;
  updatedAt: string;
}

export default function ProdutoDetailPage() {
  const { currentUser, loadingAuth, userRole } = useAuth(); // <-- Use o useAuth
  const router = useRouter(); // <-- Use o useRouter

  const { id } = useParams<{ id: string }>();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- NOVIDADE AQUI: Proteção de rota e carregamento de dados ---
  useEffect(() => {
    if (!loadingAuth) {
      // Quando o status de autenticação termina de carregar
      if (!currentUser) {
        router.push("/login"); // Redireciona para login se não estiver autenticado
      } else {
        // Se estiver autenticado, busca os dados da página
        if (id) {
          // Garante que o ID existe antes de tentar buscar
          fetchProduto();
        } else {
          setLoading(false);
          setError("ID do produto não fornecido.");
        }
      }
    }
  }, [currentUser, loadingAuth, router, id]); // Dependências

  async function fetchProduto() {
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
  }

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

  // --- NOVIDADE AQUI: Exibir tela de carregamento de autenticação ---
  if (loadingAuth) {
    return (
      <div className="container mx-auto p-8 text-center pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Carregando Autenticação...
        </h1>
        <p>Verificando seu status de login.</p>
      </div>
    );
  }

  // --- NOVIDADE AQUI: Exibir tela de acesso negado se não logado ---
  if (!currentUser) {
    return null; // O useEffect já redirecionou, então não renderiza nada aqui
  }

  // --- NOVIDADE AQUI: Exibir tela de carregamento de dados após autenticação ---
  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes do Produto
        </h1>
        <p>Carregando detalhes do produto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-600 pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes do Produto
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="container mx-auto p-8 text-center pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes do Produto
        </h1>
        <p>Produto não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 pt-16">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
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
    </div>
  );
}
