// src/components/VendaTable.tsx

"use client";

import React from "react";
import Link from "next/link";
import { Pencil, Trash2, Eye } from "lucide-react";

interface ClienteSimples {
  id: string;
  nome: string;
}

interface ProdutoSimples {
  id: string;
  nome: string;
  sku?: string;
}

interface ItemVenda {
  id: string;
  produtoId: string;
  produto?: ProdutoSimples;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

interface Venda {
  id: string;
  clienteId: string;
  cliente?: ClienteSimples;
  dataVenda: string;
  valorTotal: number;
  statusPagamento: string;
  observacoes?: string;
  itens: ItemVenda[];
  createdAt: string;
  updatedAt: string;
}

interface VendaTableProps {
  vendas: Venda[];
  onEdit: (venda: Venda) => void;
  onDelete: (id: string, valorTotal: number) => void;
}

export default function VendaTable({
  vendas,
  onEdit,
  onDelete,
}: VendaTableProps) {
  if (vendas.length === 0) {
    return (
      <p className="text-lg text-center text-gray-500 mt-8">
        Nenhuma venda registrada ainda.
      </p>
    );
  }

  return (
    <div className="mt-8">
      {/* MOBILE: Cards */}
      <div className="grid gap-4 md:hidden">
        {vendas.map((venda) => (
          <div
            key={venda.id}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              Venda para: {venda.cliente?.nome || "—"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Data: {new Date(venda.dataVenda).toLocaleDateString("pt-BR")}
            </p>
            <p className="text-sm text-gray-600">
              Valor Total: R$ {venda.valorTotal.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              Status: {venda.statusPagamento}
            </p>
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-700">Itens:</h4>
              {venda.itens.map((item, idx) => (
                <p key={item.id || idx} className="text-xs text-gray-600">
                  {item.quantidade}x{" "}
                  {item.produto?.nome || "Produto Desconhecido"} (R${" "}
                  {item.subtotal.toFixed(2)})
                </p>
              ))}
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <Link
                href={`/vendas/${venda.id}`}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-md text-xs flex items-center gap-1"
              >
                <Eye size={14} /> Ver
              </Link>
              <button
                onClick={() => onEdit(venda)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"
              >
                <Pencil size={14} /> Editar
              </button>
              <button
                onClick={() => onDelete(venda.id, venda.valorTotal)}
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
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status Pag.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Itens
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendas.map((venda) => (
              <tr key={venda.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                  {venda.cliente?.nome || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(venda.dataVenda).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  R$ {venda.valorTotal.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {venda.statusPagamento}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {venda.itens.map((item, idx) => (
                    <div key={item.id || idx} className="whitespace-nowrap">
                      {item.quantidade}x{" "}
                      {item.produto?.nome || "Produto Desconhecido"}
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                  <Link
                    href={`/vendas/${venda.id}`}
                    className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                  >
                    <Eye size={14} className="mr-1" />
                    Ver
                  </Link>
                  <button
                    onClick={() => onEdit(venda)}
                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                  >
                    <Pencil size={14} className="mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(venda.id, venda.valorTotal)}
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
