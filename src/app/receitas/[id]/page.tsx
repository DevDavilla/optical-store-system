// src/app/receitas/[id]/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Importa motion para animações

// Interfaces (idealmente em um arquivo de tipos global)
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

  // Função para buscar a receita (envolvida em useCallback)
  const fetchReceita = useCallback(async () => {
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
  }, [id]);

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
  }, [currentUser, loadingAuth, router, id, fetchReceita]);

  // Formatação de datas
  const formattedDataReceita = receita?.dataReceita
    ? new Date(receita.dataReceita).toLocaleDateString("pt-BR")
    : "Não informado";
  const formattedCreatedAt = receita?.createdAt
    ? new Date(receita.createdAt).toLocaleString("pt-BR")
    : "Não informado";
  const formattedUpdatedAt = receita?.updatedAt
    ? new Date(receita.updatedAt).toLocaleString("pt-BR")
    : "Não informado";

  // Framer Motion variants para animação de entrada
  const pageVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // --- TELAS DE CARREGAMENTO E ERRO PADRONIZADAS ---
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-xl text-center"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Carregando Autenticação...
          </h1>
          <p className="text-gray-600">Verificando seu status de login.</p>
        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-xl text-center"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Carregando Detalhes da Receita...
          </h1>
          <p className="text-gray-600">Buscando dados do sistema.</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-xl text-center"
        >
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Erro ao Carregar Receita
          </h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchReceita}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm"
          >
            Tentar Novamente
          </button>
        </motion.div>
      </div>
    );
  }

  if (!receita) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-xl text-center"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Receita não encontrada
          </h1>
          <p className="text-gray-600">
            A receita com o ID especificado não foi encontrada.
          </p>
          <Link href="/receitas">
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm">
              Voltar para Receitas
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto p-8 pt-16"
      initial="hidden"
      animate="show"
      variants={pageVariants}
    >
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg mb-8">
          Detalhes da Receita
        </h1>

        {/* Informações da Receita */}
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
    </motion.div>
  );
}
