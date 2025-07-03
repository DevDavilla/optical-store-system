// src/app/cadastrar/page.tsx

"use client";

import { useState } from "react";
import CombinedClientRecipeForm from "@/components/CombinedClientRecipeForm";
import Notification from "@/components/Notification";
import { useRouter } from "next/navigation"; // Para redirecionar após o cadastro

// Interfaces (idealmente em um arquivo de tipos global)
interface Cliente {
  id?: string;
  nome: string;
  telefone?: string;
  email?: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
}

interface Receita {
  id?: string;
  clienteId: string;
  dataReceita: string;
  observacoes?: string;
  odEsferico?: number;
  odCilindrico?: number;
  odEixo?: number;
  odAdicao?: number;
  oeEsferico?: number;
  oeCilindrico?: number;
  oeEixo?: number;
  oeAdicao?: number;
  distanciaPupilar?: number;
}

export default function CadastrarPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const router = useRouter(); // Instancia o roteador para redirecionamento

  const handleSubmit = async (data: {
    cliente: Partial<Cliente>;
    receita: Partial<Receita>;
  }) => {
    setFormError(null);
    setIsSubmitting(true);

    if (!data.cliente.nome || !data.cliente.cpf) {
      // Validação mínima
      setFormError("Nome e CPF do cliente são obrigatórios.");
      setIsSubmitting(false);
      return;
    }
    if (!data.receita.dataReceita) {
      // Validação mínima para receita
      setFormError("Data da Receita é obrigatória.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Cadastrar o Cliente
      const clientResponse = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.cliente),
      });

      if (!clientResponse.ok) {
        const errorData = await clientResponse.json();
        throw new Error(
          errorData.message ||
            `Erro ao cadastrar cliente! Status: ${clientResponse.status}`
        );
      }
      const newClient: Cliente = await clientResponse.json();
      const newClientId = newClient.id; // Pega o ID do cliente recém-criado

      if (!newClientId) {
        throw new Error("ID do cliente não retornado após cadastro.");
      }

      // 2. Cadastrar a Receita, associando ao cliente recém-criado
      const recipeDataWithClientId = {
        ...data.receita,
        clienteId: newClientId,
      };
      const recipeResponse = await fetch("/api/receitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipeDataWithClientId),
      });

      if (!recipeResponse.ok) {
        const errorData = await recipeResponse.json();
        throw new Error(
          errorData.message ||
            `Erro ao cadastrar receita! Status: ${recipeResponse.status}`
        );
      }

      setNotification({
        message: `Cliente "${newClient.nome}" e Receita cadastrados com sucesso!`,
        type: "success",
      });

      // Opcional: Redirecionar para a página de clientes ou detalhes do cliente
      setTimeout(() => {
        router.push(`/clientes/${newClientId}`); // Redireciona para os detalhes do novo cliente
      }, 2000); // Redireciona após 2 segundos para o usuário ver a notificação
    } catch (err: any) {
      console.error("Falha ao cadastrar cliente e receita:", err);
      setFormError(
        err.message ||
          "Erro ao cadastrar. Verifique os dados e tente novamente."
      );
      setNotification({
        message: err.message || "Erro ao cadastrar.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-8 pt-16">
      {" "}
      {/* Adicionado pt-16 para compensar a Navbar */}
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Cadastro Completo
      </h1>
      <CombinedClientRecipeForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        formError={formError}
      />
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
