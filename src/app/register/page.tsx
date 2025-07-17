// src/app/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Notification from "@/components/Notification";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const { currentUser, loadingAuth, userRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("funcionario");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!loadingAuth) {
      if (!currentUser) {
        router.push("/login");
      } else if (userRole && userRole !== "admin") {
        setNotification({
          message:
            "Acesso negado. Apenas administradores podem registrar novos usuários.",
          type: "error",
        });
        router.push("/");
      }
    }
  }, [currentUser, loadingAuth, userRole, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotification(null);
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      const msg = "As senhas não coincidem.";
      setError(msg);
      setNotification({ message: msg, type: "error" });
      setIsSubmitting(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: selectedRole,
        createdAt: new Date(),
      });

      setNotification({
        message: `Usuário ${email} (${selectedRole}) registrado com sucesso!`,
        type: "success",
      });

      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setSelectedRole("funcionario");
    } catch (err: any) {
      let errorMessage = "Erro ao cadastrar. Tente novamente.";
      if (err.code === "auth/email-already-in-use")
        errorMessage = "Este e-mail já está em uso.";
      else if (err.code === "auth/invalid-email")
        errorMessage = "Formato de e-mail inválido.";
      else if (err.code === "auth/weak-password")
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      setError(errorMessage);
      setNotification({ message: errorMessage, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-700">Verificando permissões...</p>
      </div>
    );
  }

  if (!currentUser || userRole !== "admin") return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-indigo-100 to-blue-100 px-4 py-16">
      <motion.div
        className="w-full max-w-md p-8 bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-extrabold text-center text-indigo-900 mb-6">
          Registrar Novo Usuário
        </h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-indigo-800"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border border-indigo-200 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-indigo-800"
            >
              Senha:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full border border-indigo-200 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-indigo-800"
            >
              Confirmar Senha:
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full border border-indigo-200 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-indigo-800"
            >
              Permissão:
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="mt-1 block w-full border border-indigo-200 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-indigo-400"
            >
              <option value="funcionario">Funcionário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-lg hover:brightness-110 transition disabled:opacity-50"
          >
            {isSubmitting ? "Registrando..." : "Registrar Usuário"}
          </motion.button>
        </form>
        <p className="mt-4 text-center text-sm text-indigo-700">
          <Link href="/" className="font-semibold hover:underline">
            Voltar para o Início
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
