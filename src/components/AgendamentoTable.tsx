"use client";

import React from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface ClienteSimples {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
}

interface Agendamento {
  id: string;
  clienteId: string;
  cliente?: ClienteSimples;
  dataAgendamento: string;
  horaAgendamento: string;
  tipoAgendamento: string;
  observacoes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AgendamentoTableProps {
  agendamentos: Agendamento[];
  onEdit: (agendamento: Agendamento) => void;
  onDelete: (id: string) => void;
}

export default function AgendamentoTable({
  agendamentos,
  onEdit,
  onDelete,
}: AgendamentoTableProps) {
  if (agendamentos.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-8">
        Nenhum agendamento cadastrado ainda.
      </p>
    );
  }

  return (
    <div className="mt-8">
      {/* MOBILE: Cards */}
      <div className="grid gap-4 md:hidden">
        {agendamentos.map((agendamento) => (
          <div
            key={agendamento.id}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              Cliente: {agendamento.cliente?.nome || "N/A"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              📅 Data:{" "}
              {new Date(agendamento.dataAgendamento).toLocaleDateString(
                "pt-BR"
              )}
            </p>
            <p className="text-sm text-gray-600">
              ⏰ Hora: {agendamento.horaAgendamento}
            </p>
            <p className="text-sm text-gray-600">
              🛠 Tipo: {agendamento.tipoAgendamento}
            </p>
            <p className="text-sm text-gray-600">
              📌 Status: {agendamento.status}
            </p>

            <div className="flex justify-end mt-4 gap-2">
              <Link
                href={`/agendamentos/${agendamento.id}`}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-md text-xs flex items-center gap-1"
              >
                <Eye size={14} /> Ver
              </Link>
              <button
                onClick={() => onEdit(agendamento)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"
              >
                <Pencil size={14} /> Editar
              </button>
              <button
                onClick={() => onDelete(agendamento.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"
              >
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP: Tabela */}
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
                Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agendamentos.map((agendamento) => (
              <tr key={agendamento.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                  {agendamento.cliente?.nome || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(agendamento.dataAgendamento).toLocaleDateString(
                    "pt-BR"
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {agendamento.horaAgendamento}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {agendamento.tipoAgendamento}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {agendamento.status}
                </td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                  <Link
                    href={`/agendamentos/${agendamento.id}`}
                    className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                  >
                    <Eye size={14} className="mr-1" />
                    Ver
                  </Link>
                  <button
                    onClick={() => onEdit(agendamento)}
                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                  >
                    <Pencil size={14} className="mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(agendamento.id)}
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
