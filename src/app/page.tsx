// src/app/clientes/page.tsx

"use client"; // Indica que este componente é um Client Component

import { useState, useEffect } from "react";
import ClientForm from "@/components/ClientForm";
import ClientTable from "@/components/ClientTable";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClientes() {
      try {
        const response = await fetch("/api/clientes"); // Requisição para nossa API local
        if (!response.ok) {
          throw new Error(`Erro HTTP! Status: ${response.status}`);
        }
        const data: Cliente[] = await response.json();

        setClientes(data);
      } catch (err) {
        console.error("Falha ao buscar clientes:", err);
        setError(
          "Não foi possível carregar os clientes. Tente novamente mais tarde."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchClientes();
  }, []); // O array vazio [] garante que o useEffect rode apenas uma vez ao montar o componente

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-center mb-8">
          Gestão de Clientes
        </h1>
        <p>Carregando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-600">
        <h1 className="text-4xl font-bold text-center mb-8">
          Gestão de Clientes
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Gestão de Clientes
      </h1>

      {clientes.length === 0 ? (
        <p className="text-lg text-center text-gray-700">
          Nenhum cliente cadastrado ainda.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Nome
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-800">{cliente.nome}</td>
                  <td className="py-4 px-6 text-gray-800">
                    {cliente.telefone}
                  </td>
                  <td className="py-4 px-6 text-gray-800">{cliente.email}</td>
                  <td className="py-4 px-6">
                    {/* Botões de Ação (Editar, Excluir) virão aqui */}
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs mr-2">
                      Editar
                    </button>
                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
