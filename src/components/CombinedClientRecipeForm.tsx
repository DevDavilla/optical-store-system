// src/components/CombinedClientRecipeForm.tsx

"use client";

import React, { useState } from "react";

// Interfaces para os dados do Cliente e Receita
// Idealmente, estas estariam em um arquivo de tipos global (ex: src/types/index.ts)
interface Cliente {
  id?: string; // ID é opcional para novos clientes
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
  id?: string; // ID é opcional para novas receitas
  clienteId: string; // Será preenchido após o cadastro do cliente
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

// Props que o formulário combinado vai receber do componente pai
interface CombinedFormProps {
  onSubmit: (data: {
    cliente: Partial<Cliente>;
    receita: Partial<Receita>;
  }) => Promise<void>;
  isSubmitting: boolean;
  formError: string | null;
}

export default function CombinedClientRecipeForm({
  onSubmit,
  isSubmitting,
  formError,
}: CombinedFormProps) {
  // Estado para os dados do cliente
  const [clientData, setClientData] = useState<Partial<Cliente>>({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    observacoes: "",
  });

  // Estado para os dados da receita
  const [recipeData, setRecipeData] = useState<Partial<Receita>>({
    dataReceita: new Date().toISOString().split("T")[0], // Data atual por padrão
    observacoes: "",
    odEsferico: undefined,
    odCilindrico: undefined,
    odEixo: undefined,
    odAdicao: undefined,
    oeEsferico: undefined,
    oeCilindrico: undefined,
    oeEixo: undefined,
    oeAdicao: undefined,
    distanciaPupilar: undefined,
  });

  // Lida com mudanças nos inputs do cliente
  const handleClientInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setClientData((prev) => ({ ...prev, [name]: value }));
  };

  // Lida com mudanças nos inputs da receita
  const handleRecipeInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "number" && value !== ""
        ? parseFloat(value)
        : value === ""
        ? undefined
        : value;
    setRecipeData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmitInternal = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ cliente: clientData, receita: recipeData });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Cadastrar Novo Cliente e Receita
      </h2>
      <form
        onSubmit={handleSubmitInternal}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {" "}
        {/* Aumentei o gap */}
        {/* --- Seção de Dados do Cliente --- */}
        <div className="lg:col-span-3 border-b pb-4 mb-4">
          {" "}
          {/* Linha divisória */}
          <h3 className="text-xl font-semibold mb-3 text-gray-700">
            Dados do Cliente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700"
              >
                Nome:
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={clientData.nome || ""}
                onChange={handleClientInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
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
                name="email"
                value={clientData.email || ""}
                onChange={handleClientInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="telefone"
                className="block text-sm font-medium text-gray-700"
              >
                Telefone:
              </label>
              <input
                type="text"
                id="telefone"
                name="telefone"
                value={clientData.telefone || ""}
                onChange={handleClientInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="cpf"
                className="block text-sm font-medium text-gray-700"
              >
                CPF:
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={clientData.cpf || ""}
                onChange={handleClientInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="rg"
                className="block text-sm font-medium text-gray-700"
              >
                RG:
              </label>
              <input
                type="text"
                id="rg"
                name="rg"
                value={clientData.rg || ""}
                onChange={handleClientInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="dataNascimento"
                className="block text-sm font-medium text-gray-700"
              >
                Data de Nascimento:
              </label>
              <input
                type="date"
                id="dataNascimento"
                name="dataNascimento"
                value={clientData.dataNascimento || ""}
                onChange={handleClientInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="endereco"
                className="block text-sm font-medium text-gray-700"
              >
                Endereço:
              </label>
              <input
                type="text"
                id="endereco"
                name="endereco"
                value={clientData.endereco || ""}
                onChange={handleClientInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="cidade"
                className="block text-sm font-medium text-gray-700"
              >
                Cidade:
              </label>
              <input
                type="text"
                id="cidade"
                name="cidade"
                value={clientData.cidade || ""}
                onChange={handleClientInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="estado"
                className="block text-sm font-medium text-gray-700"
              >
                Estado:
              </label>
              <input
                type="text"
                id="estado"
                name="estado"
                value={clientData.estado || ""}
                onChange={handleClientInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="cep"
                className="block text-sm font-medium text-gray-700"
              >
                CEP:
              </label>
              <input
                type="text"
                id="cep"
                name="cep"
                value={clientData.cep || ""}
                onChange={handleClientInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="observacoesCliente"
                className="block text-sm font-medium text-gray-700"
              >
                Observações do Cliente:
              </label>
              <textarea
                id="observacoesCliente"
                name="observacoes"
                value={clientData.observacoes || ""}
                onChange={handleClientInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              ></textarea>
            </div>
          </div>
        </div>
        {/* --- Seção de Dados da Receita --- */}
        <div className="lg:col-span-3">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">
            Dados da Receita
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="dataReceita"
                className="block text-sm font-medium text-gray-700"
              >
                Data da Receita:
              </label>
              <input
                type="date"
                id="dataReceita"
                name="dataReceita"
                value={recipeData.dataReceita || ""}
                onChange={handleRecipeInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            {/* Campos para o Olho Direito (OD) */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-medium mt-4 mb-2 text-gray-600">
                Olho Direito (OD)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor="odEsferico"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Esférico:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="odEsferico"
                    name="odEsferico"
                    value={recipeData.odEsferico ?? ""}
                    onChange={handleRecipeInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="odCilindrico"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Cilíndrico:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="odCilindrico"
                    name="odCilindrico"
                    value={recipeData.odCilindrico ?? ""}
                    onChange={handleRecipeInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="odEixo"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Eixo:
                  </label>
                  <input
                    type="number"
                    step="1"
                    id="odEixo"
                    name="odEixo"
                    value={recipeData.odEixo ?? ""}
                    onChange={handleRecipeInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="odAdicao"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Adição:
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    id="odAdicao"
                    name="odAdicao"
                    value={recipeData.odAdicao ?? ""}
                    onChange={handleRecipeInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
            </div>

            {/* Campos para o Olho Esquerdo (OE) */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-medium mt-4 mb-2 text-gray-600">
                Olho Esquerdo (OE)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor="oeEsferico"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Esférico:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="oeEsferico"
                    name="oeEsferico"
                    value={recipeData.oeEsferico ?? ""}
                    onChange={handleRecipeInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="oeCilindrico"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Cilíndrico:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="oeCilindrico"
                    name="oeCilindrico"
                    value={recipeData.oeCilindrico ?? ""}
                    onChange={handleRecipeInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="oeEixo"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Eixo:
                  </label>
                  <input
                    type="number"
                    step="1"
                    id="oeEixo"
                    name="oeEixo"
                    value={recipeData.oeEixo ?? ""}
                    onChange={handleRecipeInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="oeAdicao"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Adição:
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    id="oeAdicao"
                    name="oeAdicao"
                    value={recipeData.oeAdicao ?? ""}
                    onChange={handleRecipeInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
            </div>

            {/* Distância Pupilar e Observações da Receita */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-medium mt-4 mb-2 text-gray-600">
                Outros Dados da Receita
              </h4>
              <div>
                <label
                  htmlFor="distanciaPupilar"
                  className="block text-sm font-medium text-gray-700"
                >
                  Distância Pupilar (DP):
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="distanciaPupilar"
                  name="distanciaPupilar"
                  value={recipeData.distanciaPupilar ?? ""}
                  onChange={handleRecipeInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="observacoesReceita"
                  className="block text-sm font-medium text-gray-700"
                >
                  Observações da Receita:
                </label>
                <textarea
                  id="observacoesReceita"
                  name="observacoes"
                  value={recipeData.observacoes || ""}
                  onChange={handleRecipeInputChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        {formError && (
          <p className="lg:col-span-3 text-red-600 text-sm">{formError}</p>
        )}
        <div className="lg:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar Cliente e Receita"}
          </button>
        </div>
      </form>
    </div>
  );
}
