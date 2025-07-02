"use client";

import React from "react";
import Link from "next/link";

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

export default function ClienteTable({
  clientes,
  onEdit,
  onDelete,
}: ClienteTableProps) {
  if (clientes.length === 0) {
    return (
      <p className="text-lg text-center text-gray-700">
        Nenhum cliente cadastrado ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-100 border-b">
            {["Nome", "Telefone", "Email", "CPF", "Ações"].map((col) => (
              <th
                key={col}
                className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id} className="border-b hover:bg-gray-50">
              <td className="py-4 px-6 text-gray-800">{cliente.nome}</td>
              <td className="py-4 px-6 text-gray-800">{cliente.telefone}</td>
              <td className="py-4 px-6 text-gray-800">{cliente.email}</td>
              <td className="py-4 px-6 text-gray-800">{cliente.cpf}</td>
              <td className="py-4 px-6">
                <Link href={`/clientes/${cliente.id}`}>
                  <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded text-xs mr-2">
                    Ver Detalhes
                  </button>
                </Link>
                <button
                  onClick={() => onEdit(cliente)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(cliente.id, cliente.nome)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
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
