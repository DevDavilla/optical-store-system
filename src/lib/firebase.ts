// src/lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Importa getFirestore

// Sua configuração do Firebase (obtida do .env.local)
// Certifique-se de que estas variáveis de ambiente estão definidas no seu .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Inicializa o Firebase App
const app = initializeApp(firebaseConfig);

// Obtém a instância de autenticação
export const auth = getAuth(app);

// Obtém a instância do Firestore
export const db = getFirestore(app); // Exporta a instância 'db'
