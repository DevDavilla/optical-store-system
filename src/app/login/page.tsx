"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Notification from "@/components/Notification";
import { motion } from "framer-motion";

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
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      let errorMessage = "Erro ao fazer login. Verifique seu e-mail e senha.";
      if (err.code === "auth/invalid-email") errorMessage = "E-mail inválido.";
      else if (err.code === "auth/user-not-found")
        errorMessage = "Usuário não encontrado.";
      else if (err.code === "auth/wrong-password")
        errorMessage = "Senha incorreta.";
      setError(errorMessage);
      setNotification({ message: errorMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white/60 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/30"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-center bg-gradient-to-r from-blue-700 to-indigo-600 text-transparent bg-clip-text mb-6"
        >
          Fazer Login
        </motion.h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-semibold py-2.5 rounded-lg shadow-md transition"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </motion.button>
        </form>

        <p className="mt-5 text-sm text-center text-gray-600">
          Não tem uma conta?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            Cadastre-se
          </Link>
        </p>
      </motion.div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
