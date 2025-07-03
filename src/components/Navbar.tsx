// ✅ NAVBAR ATUALIZADO E MELHORADO COM UI/UX MODERNO
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/clientes", label: "Clientes" },
    { href: "/receitas", label: "Receitas" },
    { href: "/cadastrar", label: "Cadastro" },
    { href: "/agendamentos", label: "Agendamentos" },
    { href: "/produtos", label: "Produtos" },
  ];

  const linkStyle = (href: string) =>
    pathname === href
      ? "text-blue-600 font-semibold border-b-2 border-blue-600"
      : "text-gray-700 hover:text-blue-600";

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-gp-sl.jpg"
              alt="Logo da Ótica"
              width={50}
              height={50}
              priority
              className="rounded-full mr-2"
            />
            <span className="text-lg font-semibold text-gray-800 hidden sm:block">
              Ótica SL
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
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
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-gray-700 hover:text-gray-900 focus:outline-none"
            onClick={toggleMenu}
            aria-label="Abrir menu"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${linkStyle(link.href)} block text-sm py-1`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
