// src/app/clientes/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Importa useParams para pegar o ID da URL
import Link from "next/link"; // Importa Link para o botão de voltar

interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>(); // Pega o ID do cliente da URL
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      // Garante que o ID existe antes de tentar buscar
      setLoading(false);
      setError("ID do cliente não fornecido.");
      return;
    }

    async function fetchCliente() {
      try {
        const response = await fetch(`/api/clientes/${id}`); // Busca cliente pela API dinâmica
        if (!response.ok) {
          throw new Error(`Erro HTTP! Status: ${response.status}`);
        }
        const data: Cliente = await response.json();
        setCliente(data);
      } catch (err) {
        console.error("Falha ao buscar detalhes do cliente:", err);
        setError("Não foi possível carregar os detalhes do cliente.");
      } finally {
        setLoading(false);
      }
    }

    fetchCliente();
  }, [id]); // O useEffect roda novamente se o ID na URL mudar

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes do Cliente
        </h1>
        <p>Carregando detalhes do cliente...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-600">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes do Cliente
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes do Cliente
        </h1>
        <p>Cliente não encontrado.</p>
      </div>
    );
  }

  // Converte a data de nascimento para um formato legível
  const formattedDataNascimento = cliente.dataNascimento
    ? new Date(cliente.dataNascimento).toLocaleDateString("pt-BR")
    : "Não informado";

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
          Detalhes de {cliente.nome}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg mb-8">
          <p>
            <strong>Nome:</strong> {cliente.nome}
          </p>
          <p>
            <strong>Email:</strong> {cliente.email || "Não informado"}
          </p>
          <p>
            <strong>Telefone:</strong> {cliente.telefone || "Não informado"}
          </p>
          <p>
            <strong>CPF:</strong> {cliente.cpf || "Não informado"}
          </p>
          <p>
            <strong>RG:</strong> {cliente.rg || "Não informado"}
          </p>
          <p>
            <strong>Data de Nascimento:</strong> {formattedDataNascimento}
          </p>
          <p className="md:col-span-2">
            <strong>Endereço:</strong> {cliente.endereco || "Não informado"}
          </p>
          <p>
            <strong>Cidade:</strong> {cliente.cidade || "Não informado"}
          </p>
          <p>
            <strong>Estado:</strong> {cliente.estado || "Não informado"}
          </p>
          <p>
            <strong>CEP:</strong> {cliente.cep || "Não informado"}
          </p>
          <p className="md:col-span-2">
            <strong>Observações:</strong> {cliente.observacoes || "Nenhuma"}
          </p>
          <p>
            <strong>Criado em:</strong>{" "}
            {new Date(cliente.createdAt).toLocaleString("pt-BR")}
          </p>
          <p>
            <strong>Última atualização:</strong>{" "}
            {new Date(cliente.updatedAt).toLocaleString("pt-BR")}
          </p>
        </div>

        {/* Botão de voltar para a lista de clientes */}
        <Link href="/clientes">
          <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md shadow-sm">
            Voltar para a Lista
          </button>
        </Link>
      </div>
    </div>
  );
}
