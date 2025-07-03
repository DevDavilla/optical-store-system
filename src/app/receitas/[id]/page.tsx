// src/app/receitas/[id]/page.tsx

"use client"; // ESSENCIAL para usar hooks e renderizar no cliente

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// Interfaces (melhor em um arquivo global de tipos, mas por enquanto aqui)
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

export default function ReceitaDetailPage() {
  const { id } = useParams<{ id: string }>(); // Pega o ID da receita da URL
  const [receita, setReceita] = useState<Receita | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("ID da receita não fornecido.");
      return;
    }

    async function fetchReceita() {
      try {
        const response = await fetch(`/api/receitas/${id}`); // Busca receita pela API dinâmica
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

    fetchReceita();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes da Receita
        </h1>
        <p>Carregando detalhes da receita...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-600">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes da Receita
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!receita) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-center mb-8">
          Detalhes da Receita
        </h1>
        <p>Receita não encontrada.</p>
      </div>
    );
  }

  // Formatação de datas
  const formattedDataReceita = receita.dataReceita
    ? new Date(receita.dataReceita).toLocaleDateString("pt-BR")
    : "Não informado";
  const formattedCreatedAt = new Date(receita.createdAt).toLocaleString(
    "pt-BR"
  );
  const formattedUpdatedAt = new Date(receita.updatedAt).toLocaleString(
    "pt-BR"
  );

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
          Detalhes da Receita
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-lg mb-8">
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
          </div>

          <p className="lg:col-span-3 mt-4">
            <strong>Criado em:</strong> {formattedCreatedAt}
          </p>
          <p className="lg:col-span-3">
            <strong>Última atualização:</strong> {formattedUpdatedAt}
          </p>
        </div>

        {/* Botão de voltar para a lista de receitas */}
        <Link href="/receitas">
          <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md shadow-sm mt-8">
            Voltar para a Lista de Receitas
          </button>
        </Link>
      </div>
    </div>
  );
}
