// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion"; // <-- NOVIDADE AQUI: Importa motion

// Define a interface para o contexto de autenticação
interface AuthContextType {
  currentUser: User | null;
  loadingAuth: boolean;
  userRole: string | null;
  logout: () => Promise<void>;
}

// Cria o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

// Provedor de autenticação
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserRole(userDocSnap.data()?.role || null);
        } else {
          console.warn(
            `Documento de papel não encontrado para o usuário ${user.uid}. Atribuindo papel padrão 'funcionario'.`
          );
          await setDoc(
            userDocRef,
            { email: user.email, role: "funcionario", createdAt: new Date() },
            { merge: true }
          );
          setUserRole("funcionario");
        }
      } else {
        setUserRole(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  // Framer Motion variants para animação de entrada da tela de carregamento
  const loadingVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  // --- NOVIDADE AQUI: Tela de carregamento de autenticação padronizada ---
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f7fa] via-white to-[#f7f7fa] p-4 pt-16">
        <motion.div
          initial="hidden"
          animate="show"
          variants={loadingVariants}
          className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-xl text-center"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Carregando Autenticação...
          </h1>
          <p className="text-gray-600">
            Verificando seu status de login e permissões.
          </p>
        </motion.div>
      </div>
    );
  }

  // Renderiza os filhos (o restante da aplicação) se a autenticação estiver carregada
  return (
    <AuthContext.Provider
      value={{ currentUser, loadingAuth, userRole, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
