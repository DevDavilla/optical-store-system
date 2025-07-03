// src/app/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Stats {
  totalClientes: number;
  totalReceitas: number;
  totalAgendamentosPendentes: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  async function fetchStats() {
    setLoadingStats(true);
    setErrorStats(null);
    try {
      const response = await fetch("/api/stats");
      if (!response.ok)
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      const data: Stats = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Falha ao buscar estatísticas:", err);
      setErrorStats("Não foi possível carregar as estatísticas.");
    } finally {
      setLoadingStats(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
      <div className="bg-white p-6 sm:p-10 rounded-xl shadow-md">
        <div className="flex flex-col items-center">
          <Image
            src="/logo-gp-sl.jpg"
            alt="Logo da Ótica"
            width={120}
            height={120}
            className="rounded-full shadow mb-6"
            priority
          />
          <h1 className="text-3xl sm:text-5xl font-extrabold text-blue-800 text-center mb-4">
            Bem-vindo ao seu Sistema
          </h1>
          <p className="text-base sm:text-xl text-gray-700 text-center max-w-2xl mb-8">
            Sua solução completa para gerenciar clientes, receitas e
            agendamentos com praticidade.
          </p>
        </div>

        {/* Estatísticas rápidas */}
        <div className="mt-10 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">
            Visão Geral Rápida
          </h2>
          {loadingStats ? (
            <p className="text-center text-gray-500">
              Carregando estatísticas...
            </p>
          ) : errorStats ? (
            <p className="text-center text-red-600">{errorStats}</p>
          ) : stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  label: "Clientes Cadastrados",
                  value: stats.totalClientes,
                  href: "/clientes",
                },
                {
                  label: "Receitas Registradas",
                  value: stats.totalReceitas,
                  href: "/receitas",
                },
                {
                  label: "Agendamentos Pendentes",
                  value: stats.totalAgendamentosPendentes,
                  href: "/agendamentos",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gray-50 p-6 rounded-lg shadow-sm border hover:shadow-md transition"
                >
                  <p className="text-3xl font-bold text-gray-800 text-center">
                    {stat.value}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 mt-2 text-center">
                    {stat.label}
                  </p>
                  <Link href={stat.href}>
                    <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm">
                      Ver
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Ações rápidas */}
        <div className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">
            Ações Rápidas
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-xl mx-auto">
            <Link href="/cadastrar" className="w-full">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md text-base">
                <span className="mr-2">➕</span> Cadastrar Novo Cliente
              </button>
            </Link>
            <Link href="/agendamentos" className="w-full">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md text-base">
                <span className="mr-2">📅</span> Agendar Atendimento
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
