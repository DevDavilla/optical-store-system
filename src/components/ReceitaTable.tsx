"use client";

import React from "react";
import Link from "next/link";
import { Pencil, Trash2, Eye } from "lucide-react";

interface ClienteSimples {
  id: string;
  nome: string;
}

interface Receita {
  id: string;
  clienteId: string;
  cliente?: ClienteSimples;
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
  createdAt: string;
  updatedAt: string;
}

interface ReceitaTableProps {
  receitas: Receita[];
  onEdit: (receita: Receita) => void;
  onDelete: (id: string) => void;
}

export default function ReceitaTable({
  receitas,
  onEdit,
  onDelete,
}: ReceitaTableProps) {
  if (receitas.length === 0) {
    return (
      <p className="text-lg text-center text-gray-500 mt-8">
        Nenhuma receita cadastrada ainda.
      </p>
    );
  }

  return (
    <div className="mt-8">
      {/* MOBILE: Cards */}
      <div className="grid gap-4 md:hidden">
        {receitas.map((receita) => (
          <div
            key={receita.id}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              Receita do Cliente: {receita.cliente?.nome || "—"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Data: {new Date(receita.dataReceita).toLocaleDateString("pt-BR")}
            </p>
            <p className="text-sm text-gray-600">
              OD Esférico: {receita.odEsferico ?? "—"}
            </p>
            <p className="text-sm text-gray-600">
              OE Esférico: {receita.oeEsferico ?? "—"}
            </p>
            <p className="text-sm text-gray-600">
              DP: {receita.distanciaPupilar ?? "—"}
            </p>
            <p className="text-sm text-gray-600">
              DNP: {receita.distanciaNauseaPupilar ?? "—"}
            </p>
            <p className="text-sm text-gray-600">
              Altura: {receita.alturaLente ?? "—"}
            </p>
            <div className="flex justify-end mt-4 gap-2">
              <Link
                href={`/receitas/${receita.id}`}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-md text-xs flex items-center gap-1"
              >
                <Eye size={14} /> Ver
              </Link>
              <button
                onClick={() => onEdit(receita)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"
              >
                <Pencil size={14} /> Editar
              </button>
              <button
                onClick={() => onDelete(receita.id)}
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
                Data Receita
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                OD Esférico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                OE Esférico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DNP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Altura
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {receitas.map((receita) => (
              <tr key={receita.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                  {receita.cliente?.nome || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(receita.dataReceita).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {receita.odEsferico ?? "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {receita.oeEsferico ?? "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {receita.distanciaPupilar ?? "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {receita.distanciaNauseaPupilar ?? "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {receita.alturaLente ?? "—"}
                </td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                  <Link
                    href={`/receitas/${receita.id}`}
                    className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                  >
                    <Eye size={14} className="mr-1" />
                    Ver
                  </Link>
                  <button
                    onClick={() => onEdit(receita)}
                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                  >
                    <Pencil size={14} className="mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(receita.id)}
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
