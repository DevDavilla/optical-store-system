// src/components/ReceitaTable.tsx

"use client";

import React from "react";
import Link from "next/link";
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
      <p className="text-lg text-center text-gray-700">
        Nenhuma receita cadastrada ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-4">Lista de Receitas</h2>
      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Cliente
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Data Receita
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              OD Esférico
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              OE Esférico
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              DP
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {receitas.map((receita) => (
            <tr key={receita.id} className="border-b hover:bg-gray-50">
              <td className="py-4 px-4 text-gray-800">
                {receita.cliente?.nome || "N/A"}
              </td>
              <td className="py-4 px-4 text-gray-800">
                {new Date(receita.dataReceita).toLocaleDateString("pt-BR")}
              </td>
              <td className="py-4 px-4 text-gray-800">
                {receita.odEsferico ?? "N/A"}
              </td>
              <td className="py-4 px-4 text-gray-800">
                {receita.oeEsferico ?? "N/A"}
              </td>
              <td className="py-4 px-4 text-gray-800">
                {receita.distanciaPupilar ?? "N/A"}
              </td>
              <td className="py-4 px-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(receita)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(receita.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                  >
                    Excluir
                  </button>
                </div>
                <Link href={`/receitas/${receita.id}`}>
                  <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded text-xs">
                    Ver Detalhes
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
