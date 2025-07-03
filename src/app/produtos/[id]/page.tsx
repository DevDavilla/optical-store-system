// src/app/produtos/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Produto {
  id: string;
  nome: string;
  tipo: string;
  marca?: string;
  modelo?: string;
  quantidadeEmEstoque: number;
  precoCusto?: number;
  precoVenda?: number;
  fornecedor?: string;
  descricao?: string;
  sku?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProdutoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("ID do produto não fornecido.");
      return;
    }

    async function fetchProduto() {
      try {
        const response = await fetch(`/api/produtos/${id}`); // Busca produto pela API dinâmica
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

    fetchProduto();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes do Produto
        </h1>
        <p>Carregando detalhes do produto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-600">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes do Produto
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes do Produto
        </h1>
        <p>Produto não encontrado.</p>
      </div>
    );
  }

  // Formatação de datas e preços
  const formattedCreatedAt = new Date(produto.createdAt).toLocaleString(
    "pt-BR"
  );
  const formattedUpdatedAt = new Date(produto.updatedAt).toLocaleString(
    "pt-BR"
  );
  const formattedPrecoCusto = produto.precoCusto
    ? `R$ ${produto.precoCusto.toFixed(2)}`
    : "N/A";
  const formattedPrecoVenda = produto.precoVenda
    ? `R$ ${produto.precoVenda.toFixed(2)}`
    : "N/A";

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
          Detalhes do Produto: {produto.nome}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-lg mb-8">
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

        {/* Botão de voltar para a lista de produtos */}
        <Link href="/produtos">
          <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md shadow-sm mt-8">
            Voltar para a Lista de Produtos
          </button>
        </Link>
      </div>
    </div>
  );
}
