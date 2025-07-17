// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // Importa 'auth' e 'db' do seu arquivo firebase.ts
import { doc, getDoc, setDoc } from "firebase/firestore"; // Importa funções do Firestore

// Define a interface para o contexto de autenticação
interface AuthContextType {
  currentUser: User | null; // O objeto User do Firebase, ou null se não logado
  loadingAuth: boolean; // Indica se o estado de autenticação ainda está sendo carregado
  userRole: string | null; // Papel do usuário (ex: 'admin', 'funcionario')
  logout: () => Promise<void>; // Função para fazer logout
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
  const [loadingAuth, setLoadingAuth] = useState(true); // Começa como true
  const [userRole, setUserRole] = useState<string | null>(null); // Estado para o papel do usuário

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Se o usuário estiver logado, busca o papel dele no Firestore
        const userDocRef = doc(db, "users", user.uid); // Usa a instância 'db' aqui
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserRole(userDocSnap.data()?.role || null);
        } else {
          // Se o documento do usuário não existir no Firestore (primeiro login ou erro no registro),
          // cria um com papel padrão 'funcionario'
          console.warn(
            `Documento de papel não encontrado para o usuário ${user.uid}. Atribuindo papel padrão 'funcionario'.`
          );
          await setDoc(
            userDocRef,
            { email: user.email, role: "funcionario", createdAt: new Date() },
            { merge: true }
          ); // Usa 'db' aqui
          setUserRole("funcionario");
        }
      } else {
        setUserRole(null); // Limpa o papel se o usuário não estiver logado
      }
      setLoadingAuth(false); // Define como false após o estado inicial ser determinado
    });

    // Limpa a inscrição quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, loadingAuth, userRole, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
