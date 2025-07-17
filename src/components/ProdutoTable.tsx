// src/components/ProdutoTable.tsx

"use client";

import React from "react";
import Link from "next/link";
import { Pencil, Trash2, Eye } from "lucide-react";

type TipoProdutoEnum =
  | "Armacao"
  | "LenteDeGrau"
  | "LenteDeContato"
  | "Acessorio"
  | "Servico"
  | "Outro";

interface Produto {
  id: string;
  nome: string;
  tipo: TipoProdutoEnum;
  marca?: string;
  modelo?: string;
  quantidadeEmEstoque: number;
  precoVenda?: number;
  sku?: string;
  grauEsfericoOD?: number;
  grauEsfericoOE?: number;
  poderLenteContato?: number;
}

interface ProdutoTableProps {
  produtos: Produto[];
  onEdit: (produto: Produto) => void;
  onDelete: (id: string, nome: string) => void;
}

export default function ProdutoTable({
  produtos,
  onEdit,
  onDelete,
}: ProdutoTableProps) {
  if (produtos.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-8">
        Nenhum produto cadastrado ainda.
      </p>
    );
  }

  return (
    <div className="mt-8">
      {/* MOBILE: Cards */}
      <div className="grid gap-4 md:hidden">
        {produtos.map((produto) => (
          <div
            key={produto.id}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              {produto.nome}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Tipo: {produto.tipo}</p>
            <p className="text-sm text-gray-600">
              Marca/Modelo: {produto.marca || "—"}{" "}
              {produto.modelo ? `/ ${produto.modelo}` : ""}
            </p>
            <p className="text-sm text-gray-600">
              Quantidade: {produto.quantidadeEmEstoque}
            </p>
            <p className="text-sm text-gray-600">
              Preço:{" "}
              {produto.precoVenda ? `R$ ${produto.precoVenda.toFixed(2)}` : "—"}
            </p>
            <p className="text-sm text-gray-600">SKU: {produto.sku || "—"}</p>
            <p className="text-sm text-gray-600">
              {produto.tipo === "LenteDeGrau" &&
                `OD: ${produto.grauEsfericoOD ?? "N/A"} / OE: ${
                  produto.grauEsfericoOE ?? "N/A"
                }`}
              {produto.tipo === "LenteDeContato" &&
                `Poder: ${produto.poderLenteContato ?? "N/A"}`}
            </p>

            <div className="flex justify-end mt-4 gap-2">
              <Link
                href={`/produtos/${produto.id}`}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-md text-xs flex items-center gap-1"
              >
                <Eye size={14} /> Ver
              </Link>
              <button
                onClick={() => onEdit(produto)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"
              >
                <Pencil size={14} /> Editar
              </button>
              <button
                onClick={() => onDelete(produto.id, produto.nome)}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"
              >
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP: Tabela tradicional */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marca/Modelo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qtd
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detalhes Lente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {produtos.map((produto) => (
              <tr key={produto.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                  {produto.nome}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {produto.tipo}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {produto.marca || "—"}
                  {produto.modelo ? ` / ${produto.modelo}` : ""}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {produto.quantidadeEmEstoque}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {produto.precoVenda
                    ? `R$ ${produto.precoVenda.toFixed(2)}`
                    : "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {produto.tipo === "LenteDeGrau" &&
                    `OD: ${produto.grauEsfericoOD ?? "N/A"} / OE: ${
                      produto.grauEsfericoOE ?? "N/A"
                    }`}
                  {produto.tipo === "LenteDeContato" &&
                    `Poder: ${produto.poderLenteContato ?? "N/A"}`}
                  {produto.tipo !== "LenteDeGrau" &&
                    produto.tipo !== "LenteDeContato" &&
                    "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {produto.sku || "—"}
                </td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                  <Link
                    href={`/produtos/${produto.id}`}
                    className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                  >
                    <Eye size={14} className="mr-1" />
                    Ver
                  </Link>
                  <button
                    onClick={() => onEdit(produto)}
                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                  >
                    <Pencil size={14} className="mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(produto.id, produto.nome)}
                    className="inline-flex items-center px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
