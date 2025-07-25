// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Notification from "@/components/Notification";
import { motion } from "framer-motion"; // Para animações

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotification(null);
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setNotification({
        message: "Login realizado com sucesso! Redirecionando...",
        type: "success",
      });
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      console.error("Erro no login:", err);
      let errorMessage = "Erro ao fazer login. Verifique seu e-mail e senha.";
      if (err.code === "auth/invalid-email") {
        errorMessage = "E-mail inválido.";
      } else if (err.code === "auth/user-not-found") {
        errorMessage = "Usuário não encontrado.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Senha incorreta.";
      }
      setError(errorMessage);
      setNotification({ message: errorMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Framer Motion variants para animação de entrada
  const pageVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-4 pt-16"
      initial="hidden"
      animate="show"
      variants={pageVariants}
    >
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-right text-sm">
            {" "}
            {/* Container para o link "Esqueceu a senha?" */}
            <Link
              href="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Esqueceu a senha?
            </Link>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>{" "}
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Não tem uma conta?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </motion.div>
  );
}
