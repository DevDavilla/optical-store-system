// src/components/Navbar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // Importa os ícones de menu
import Image from "next/image"; // Importa o componente Image do Next.js
import { useAuth } from "@/context/AuthContext"; // Importa o hook de autenticação

export default function Navbar() {
  const { currentUser, logout, userRole } = useAuth(); // Obtém o usuário, função de logout E o papel do usuário
  const [menuOpen, setMenuOpen] = useState(false); // Estado para controlar a abertura do menu mobile
  const pathname = usePathname(); // Obtém o caminho da URL atual para destacar o link ativo

  const toggleMenu = () => setMenuOpen(!menuOpen); // Função para alternar o estado do menu

  // Função para lidar com o logout
  const handleLogout = async () => {
    try {
      await logout(); // Chama a função de logout do AuthContext
      setMenuOpen(false); // Fecha o menu mobile após o logout
      // O redirecionamento para /login é tratado pelo onAuthStateChanged no AuthContext
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Aqui você pode usar um componente de Notificação (toast) em vez de alert
      alert("Erro ao fazer logout. Tente novamente.");
    }
  };

  // Estilo para o link ativo na navegação desktop
  const linkStyle = (href: string) =>
    pathname === href
      ? "text-blue-600 font-semibold border-b-2 border-blue-600" // Estilo para link ativo
      : "text-gray-700 hover:text-blue-600"; // Estilo para links inativos e hover

  // Links de navegação principais (agora sem Login/Registrar)
  const mainNavLinks = [
    { href: "/", label: "Início" },
    { href: "/clientes", label: "Clientes" },
    { href: "/receitas", label: "Receitas" },
    { href: "/cadastrar", label: "Cadastro" },
    { href: "/agendamentos", label: "Agendamentos" },
    { href: "/produtos", label: "Produtos" },
    { href: "/vendas", label: "Vendas" },
    { href: "/relatorios", label: "Relatórios" },
  ];

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Nome da Ótica */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-gp-sl.jpg" // Caminho atualizado para sua logo
              alt="Logo da Ótica"
              width={50} // Ajuste o tamanho conforme necessário
              height={50} // Ajuste o tamanho conforme necessário
              priority
              className="rounded-full mr-2"
            />
            <span className="text-lg font-semibold text-gray-800 hidden sm:block">
              Ótica SL
            </span>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${linkStyle(
                  link.href
                )} text-sm transition border-b-2 border-transparent hover:border-blue-500 pb-1`}
              >
                {link.label}
              </Link>
            ))}
            {/* --- NOVIDADE AQUI: Links de Autenticação/Usuário (Desktop) --- */}
            {currentUser ? ( // Se houver um usuário logado
              <>
                {userRole === "admin" && ( // Se for admin, mostra o link "Registrar"
                  <Link
                    href="/register"
                    className={`${linkStyle(
                      "/register"
                    )} text-sm transition border-b-2 border-transparent hover:border-blue-500 pb-1`}
                  >
                    Registrar
                  </Link>
                )}
                <span className="text-sm px-2 py-1 rounded-md bg-blue-100 text-blue-800 font-medium whitespace-nowrap">
                  Olá, {currentUser.email?.split("@")[0]}!
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-700 hover:text-blue-600 transition border-b-2 border-transparent hover:border-blue-500 pb-1"
                >
                  Sair
                </button>
              </>
            ) : (
              // Se não houver usuário logado
              <>
                <Link
                  href="/login"
                  className={`${linkStyle(
                    "/login"
                  )} text-sm transition border-b-2 border-transparent hover:border-blue-500 pb-1`}
                >
                  Login
                </Link>
                <Link
                  href="/register" // Link "Registrar" para usuários NÃO logados (para o primeiro admin, por exemplo)
                  className={`${linkStyle(
                    "/register"
                  )} text-sm transition border-b-2 border-transparent hover:border-blue-500 pb-1`}
                >
                  Registrar
                </Link>
              </>
            )}
          </nav>

          {/* Botão de Menu Mobile */}
          <button
            className="md:hidden text-gray-700 hover:text-gray-900 focus:outline-none"
            onClick={toggleMenu}
            aria-label="Abrir menu"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Navegação Mobile (Menu Aberto) */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <div className="px-4 py-3 space-y-2">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${linkStyle(link.href)} block text-sm py-1`}
                onClick={() => setMenuOpen(false)} // Fecha o menu ao clicar em um link
              >
                {link.label}
              </Link>
            ))}
            {/* --- NOVIDADE AQUI: Links de Autenticação/Usuário (Mobile) --- */}
            {currentUser ? ( // Se houver um usuário logado
              <>
                {userRole === "admin" && ( // Se for admin, mostra o link "Registrar"
                  <Link
                    href="/register"
                    className={`${linkStyle("/register")} block text-sm py-1`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Registrar
                  </Link>
                )}
                <span className="block text-sm py-1 text-blue-800 font-medium">
                  Olá, {currentUser.email?.split("@")[0]}!
                </span>
                <button
                  onClick={handleLogout}
                  className="block text-sm py-1 text-gray-700 hover:text-blue-600"
                >
                  Sair
                </button>
              </>
            ) : (
              // Se não houver usuário logado
              <>
                <Link
                  href="/login"
                  className={`${linkStyle("/login")} block text-sm py-1`}
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register" // Link "Registrar" para usuários NÃO logados
                  className={`${linkStyle("/register")} block text-sm py-1`}
                  onClick={() => setMenuOpen(false)}
                >
                  Registrar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
