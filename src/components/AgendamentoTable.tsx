// src/components/AgendamentoTable.tsx

"use client";

import React from "react";
import Link from "next/link";

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
  agendamentos: Agendamento[]; // Lista de agendamentos para exibir
  onEdit: (agendamento: Agendamento) => void; // Função para editar um agendamento
  onDelete: (id: string) => void; // Função para excluir um agendamento
}

export default function AgendamentoTable({
  agendamentos,
  onEdit,
  onDelete,
}: AgendamentoTableProps) {
  if (agendamentos.length === 0) {
    return (
      <p className="text-lg text-center text-gray-700">
        Nenhum agendamento cadastrado ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto mt-8">
      {" "}
      {/* Adicionado mt-8 para espaçamento */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Lista de Agendamentos
      </h2>
      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Cliente
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Data
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Hora
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Tipo
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {agendamentos.map((agendamento) => (
            <tr key={agendamento.id} className="border-b hover:bg-gray-50">
              <td className="py-4 px-4 text-gray-800">
                {agendamento.cliente?.nome || "N/A"}
              </td>
              <td className="py-4 px-4 text-gray-800">
                {new Date(agendamento.dataAgendamento).toLocaleDateString(
                  "pt-BR"
                )}
              </td>
              <td className="py-4 px-4 text-gray-800">
                {agendamento.horaAgendamento}
              </td>
              <td className="py-4 px-4 text-gray-800">
                {agendamento.tipoAgendamento}
              </td>
              <td className="py-4 px-4 text-gray-800">{agendamento.status}</td>
              <td className="py-4 px-4 flex space-x-2">
                {/* Botão Ver Detalhes (será implementado na próxima etapa) */}
                <Link href={`/agendamentos/${agendamento.id}`}>
                  <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded text-xs">
                    Ver Detalhes
                  </button>
                </Link>
                <button
                  onClick={() => onEdit(agendamento)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(agendamento.id)}
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
