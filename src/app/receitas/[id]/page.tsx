// src/app/receitas/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Interfaces (mantidas as mesmas)
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

export default function ReceitaDetailPage() {
  const { currentUser, loadingAuth, userRole } = useAuth();
  const router = useRouter();

  const { id } = useParams<{ id: string }>();
  const [receita, setReceita] = useState<Receita | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Proteção de rota e carregamento de dados
  useEffect(() => {
    if (!loadingAuth) {
      if (!currentUser) {
        router.push("/login");
      } else {
        if (id) {
          fetchReceita();
        } else {
          setLoading(false);
          setError("ID da receita não fornecido.");
        }
      }
    }
  }, [currentUser, loadingAuth, router, id]);

  async function fetchReceita() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/receitas/${id}`);
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      const data: Receita = await response.json();
      setReceita(data);
    } catch (err) {
      console.error("Falha ao buscar detalhes da receita:", err);
      setError("Não foi possível carregar os detalhes da receita.");
    } finally {
      setLoading(false);
    }
  }

  // --- CORREÇÃO AQUI: Usando encadeamento opcional para createdAt e updatedAt ---
  const formattedDataReceita = receita?.dataReceita
    ? new Date(receita.dataReceita).toLocaleDateString("pt-BR")
    : "Não informado";
  const formattedCreatedAt = receita?.createdAt
    ? new Date(receita.createdAt).toLocaleString("pt-BR")
    : "Não informado";
  const formattedUpdatedAt = receita?.updatedAt
    ? new Date(receita.updatedAt).toLocaleString("pt-BR")
    : "Não informado";

  // Exibir tela de carregamento de autenticação
  if (loadingAuth) {
    return (
      <div className="container mx-auto p-8 text-center pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Carregando Autenticação...
        </h1>
        <p>Verificando seu status de login.</p>
      </div>
    );
  }

  // Exibir tela de acesso negado se não logado
  if (!currentUser) {
    return null;
  }

  // Exibir tela de carregamento de dados após autenticação
  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes da Receita
        </h1>
        <p>Carregando detalhes da receita...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-600 pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes da Receita
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!receita) {
    return (
      <div className="container mx-auto p-8 text-center pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes da Receita
        </h1>
        <p>Receita não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 pt-16">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
          Detalhes da Receita
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-lg mb-8 border-b pb-6">
          <p className="lg:col-span-3">
            <strong>Cliente:</strong>{" "}
            {receita.cliente?.nome || "Cliente não encontrado"}
          </p>
          <p className="lg:col-span-3">
            <strong>Data da Receita:</strong> {formattedDataReceita}
          </p>
          <p className="lg:col-span-3">
            <strong>Observações:</strong> {receita.observacoes || "Nenhuma"}
          </p>

          <div className="lg:col-span-3 mt-4">
            <h2 className="text-2xl font-semibold mb-2">Olho Direito (OD)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <p>
                <strong>Esférico:</strong> {receita.odEsferico ?? "N/A"}
              </p>
              <p>
                <strong>Cilíndrico:</strong> {receita.odCilindrico ?? "N/A"}
              </p>
              <p>
                <strong>Eixo:</strong> {receita.odEixo ?? "N/A"}
              </p>
              <p>
                <strong>Adição:</strong> {receita.odAdicao ?? "N/A"}
              </p>
            </div>
          </div>

          <div className="lg:col-span-3 mt-4">
            <h2 className="text-2xl font-semibold mb-2">Olho Esquerdo (OE)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <p>
                <strong>Esférico:</strong> {receita.oeEsferico ?? "N/A"}
              </p>
              <p>
                <strong>Cilíndrico:</strong> {receita.oeCilindrico ?? "N/A"}
              </p>
              <p>
                <strong>Eixo:</strong> {receita.oeEixo ?? "N/A"}
              </p>
              <p>
                <strong>Adição:</strong> {receita.oeAdicao ?? "N/A"}
              </p>
            </div>
          </div>

          <div className="lg:col-span-3 mt-4">
            <h2 className="text-2xl font-semibold mb-2">Outros Detalhes</h2>
            <p>
              <strong>Distância Pupilar (DP):</strong>{" "}
              {receita.distanciaPupilar ?? "N/A"}
            </p>
            <p>
              <strong>Distância Naso-Pupilar (DNP):</strong>{" "}
              {receita.distanciaNauseaPupilar ?? "N/A"}
            </p>
            <p>
              <strong>Altura da Lente:</strong> {receita.alturaLente ?? "N/A"}
            </p>
          </div>

          <p className="lg:col-span-3 mt-4">
            <strong>Criado em:</strong> {formattedCreatedAt}
          </p>
          <p className="lg:col-span-3">
            <strong>Última atualização:</strong> {formattedUpdatedAt}
          </p>
        </div>

        <Link href="/receitas">
          <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md shadow-sm mt-8">
            Voltar para a Lista de Receitas
          </button>
        </Link>
      </div>
    </div>
  );
}
