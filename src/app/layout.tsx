// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Suas fontes personalizadas
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "@/context/AuthContext"; // Seu AuthProvider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Optical System",
  description: "Sistema de Ótica de alto padrão",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen pt-16
        bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] text-gray-900`}
      >
        <AuthProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}{" "}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
