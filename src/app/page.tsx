// src/app/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react"; // Adicionado useCallback
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext"; // Importe o useAuth
import { useRouter } from "next/navigation"; // Importe o useRouter

interface Stats {
  totalClientes: number;
  totalReceitas: number;
  totalAgendamentosPendentes: number;
}

export default function HomePage() {
  const { currentUser, loadingAuth, userRole } = useAuth(); // Obtém o usuário, status de carregamento e papel
  const router = useRouter(); // Hook para redirecionamento

  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  // Função para buscar estatísticas rápidas (envolvida em useCallback)
  const fetchStats = useCallback(async () => {
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
  }, []); // Dependências vazias, pois setStats é estável

  // --- LÓGICA DE PROTEÇÃO DE ROTA E CARREGAMENTO DE DADOS ---
  useEffect(() => {
    if (!loadingAuth) {
      // Só executa depois que o Firebase terminar de verificar o status de autenticação
      if (!currentUser) {
        // Se NÃO houver usuário logado, redireciona para a página de login
        router.push("/login");
      } else {
        // Se houver usuário logado, então pode buscar os dados da página
        fetchStats();
      }
    }
  }, [currentUser, loadingAuth, router, fetchStats]); // Dependências: reage a mudanças no usuário logado ou no status de carregamento da autenticação

  /* -------------------------------------------------------------- */
  /* Animation variants                                            */
  /* -------------------------------------------------------------- */
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // --- Renderização Condicional com base no status de autenticação e carregamento ---
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 pt-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Carregando Autenticação...
        </h1>
        <p>Verificando seu status de login.</p>
      </div>
    );
  }

  if (!currentUser) {
    return null; // O useEffect já redirecionou, então não renderiza nada aqui
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] pt-16" // Adicionado pt-16 para espaçamento da Navbar
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* Header */}
      <header className="w-full flex justify-center pb-12 px-4">
        {" "}
        {/* Removido pt-20, já que o pt-16 está no motion.div */}
        <motion.div
          className="flex flex-col items-center bg-white/70 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl p-8 md:p-12"
          variants={item}
        >
          <Image
            src="/logo-gp-sl.jpg"
            alt="Logo da Ótica"
            width={140}
            height={140}
            className="rounded-full shadow-lg mb-6"
            priority
          />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 drop-shadow-lg">
            Bem-vindo ao Group SL
          </h1>
          <p className="mt-4 max-w-2xl text-center text-lg md:text-xl text-gray-700">
            Sua solução completa para gerenciar clientes, receitas e
            agendamentos com praticidade.
          </p>
        </motion.div>
      </header>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-center mb-10"
          variants={item}
        >
          Visão Geral Rápida
        </motion.h2>

        {loadingStats ? (
          <p className="text-center text-gray-500">
            Carregando estatísticas...
          </p>
        ) : errorStats ? (
          <p className="text-center text-red-600">{errorStats}</p>
        ) : stats ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={container}
          >
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
              <motion.div
                key={stat.label}
                className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-200 p-8 flex flex-col items-center hover:shadow-2xl transition-shadow duration-300"
                variants={item}
                whileHover={{ translateY: -4 }}
              >
                <span className="absolute inset-x-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 top-0" />
                <p className="text-4xl font-extrabold text-gray-800">
                  {stat.value}
                </p>
                <p className="mt-2 text-gray-600 text-sm md:text-base text-center">
                  {stat.label}
                </p>
                <Link
                  href={stat.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 py-2 px-5 rounded-full shadow hover:brightness-110 transition" // Cores padronizadas
                >
                  Ver<span className="text-xl">→</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </section>

      {/* Quick Actions */}
      <section className="bg-white/80 backdrop-blur-lg py-16 border-t border-gray-100">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-center mb-10"
          variants={item}
        >
          Ações Rápidas
        </motion.h2>

        <motion.div
          className="container mx-auto flex flex-col sm:flex-row justify-center gap-6 px-4"
          variants={container}
        >
          <motion.div variants={item} whileHover={{ scale: 1.03 }}>
            <Link href="/cadastrar" className="block">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-colors duration-300">
                {" "}
                {/* Cores padronizadas */}
                <span className="text-2xl">➕</span> Cadastrar Novo Cliente
              </button>
            </Link>
          </motion.div>
          <motion.div variants={item} whileHover={{ scale: 1.03 }}>
            <Link href="/agendamentos" className="block">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-colors duration-300">
                {" "}
                {/* Cores padronizadas */}
                <span className="text-2xl">📅</span> Agendar Atendimento
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </motion.div>
  );
}
