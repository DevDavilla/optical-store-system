// src/app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Importa a instância de autenticação
import { useRouter } from "next/navigation";
import Link from "next/link";
import Notification from "@/components/Notification"; // Para notificações
import { motion } from "framer-motion"; // Para animações

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const router = useRouter();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setNotification({
        message:
          "Um link para redefinir sua senha foi enviado para o seu e-mail.",
        type: "success",
      });
      setEmail(""); // Limpa o campo de e-mail
      setTimeout(() => {
        router.push("/login"); // Opcional: redireciona para o login após sucesso
      }, 3000);
    } catch (err: any) {
      console.error("Erro ao redefinir senha:", err);
      let errorMessage =
        "Erro ao enviar e-mail de redefinição. Verifique o e-mail e tente novamente.";
      if (err.code === "auth/invalid-email") {
        errorMessage = "Formato de e-mail inválido.";
      } else if (err.code === "auth/user-not-found") {
        errorMessage = "Nenhum usuário encontrado com este e-mail.";
      }
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
          Esqueceu sua Senha?
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Insira seu e-mail abaixo para receber um link de redefinição de senha.
        </p>
        <form onSubmit={handlePasswordReset} className="space-y-4">
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
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>{" "}
                Enviando...
              </>
            ) : (
              "Redefinir Senha"
            )}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Voltar para o Login
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
