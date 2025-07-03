// src/components/ProdutoTable.tsx

"use client";

import React from "react";
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

interface ProdutoTableProps {
  produtos: Produto[]; // Lista de produtos para exibir
  onEdit: (produto: Produto) => void; // Função para editar um produto
  onDelete: (id: string, nome: string) => void; // Função para excluir um produto
}

export default function ProdutoTable({
  produtos,
  onEdit,
  onDelete,
}: ProdutoTableProps) {
  if (produtos.length === 0) {
    return (
      <p className="text-lg text-center text-gray-700">
        Nenhum produto cadastrado ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Lista de Produtos
      </h2>
      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Nome
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Tipo
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Marca
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Qtd.
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Preço Venda
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              SKU
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id} className="border-b hover:bg-gray-50">
              <td className="py-4 px-4 text-gray-800">{produto.nome}</td>
              <td className="py-4 px-4 text-gray-800">{produto.tipo}</td>
              <td className="py-4 px-4 text-gray-800">
                {produto.marca || "N/A"}
              </td>
              <td className="py-4 px-4 text-gray-800">
                {produto.quantidadeEmEstoque}
              </td>
              <td className="py-4 px-4 text-gray-800">
                {produto.precoVenda
                  ? `R$ ${produto.precoVenda.toFixed(2)}`
                  : "N/A"}
              </td>
              <td className="py-4 px-4 text-gray-800">
                {produto.sku || "N/A"}
              </td>
              <td className="py-4 px-4 flex space-x-2">
                {/* Botão Ver Detalhes (será implementado na próxima etapa) */}
                <Link href={`/produtos/${produto.id}`}>
                  <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded text-xs">
                    Ver Detalhes
                  </button>
                </Link>
                <button
                  onClick={() => onEdit(produto)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(produto.id, produto.nome)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
