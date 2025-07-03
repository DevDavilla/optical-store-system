"use client";

import React from "react";
import Link from "next/link";
import { Pencil, Trash2, Eye } from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  cpf?: string;
}

interface ClienteTableProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string, nome: string) => void;
}

export default function ClientTable({
  clientes,
  onEdit,
  onDelete,
}: ClienteTableProps) {
  if (clientes.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-8">
        Nenhum cliente cadastrado ainda.
      </p>
    );
  }

  return (
    <div className="mt-8">
      {/* MOBILE: Cards */}
      <div className="grid gap-4 md:hidden">
        {clientes.map((cliente) => (
          <div
            key={cliente.id}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              {cliente.nome}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              📞 {cliente.telefone || "Sem telefone"}
            </p>
            <p className="text-sm text-gray-600">✉️ {cliente.email || "—"}</p>

            <div className="flex justify-end mt-4 gap-2">
              <Link
                href={`/clientes/${cliente.id}`}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-md text-xs flex items-center gap-1"
              >
                <Eye size={14} /> Ver
              </Link>
              <button
                onClick={() => onEdit(cliente)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"
              >
                <Pencil size={14} /> Editar
              </button>
              <button
                onClick={() => onDelete(cliente.id, cliente.nome)}
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
                Telefone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                  {cliente.nome}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {cliente.telefone}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {cliente.email}
                </td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                  <Link
                    href={`/clientes/${cliente.id}`}
                    className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                  >
                    <Eye size={14} className="mr-1" />
                    Ver
                  </Link>
                  <button
                    onClick={() => onEdit(cliente)}
                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                  >
                    <Pencil size={14} className="mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(cliente.id, cliente.nome)}
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
