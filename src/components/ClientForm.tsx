// src/components/ClientForm.tsx

"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Plus, Save, XCircle } from "lucide-react"; // Importa ícones para os botões

// Interface para os dados do cliente (mesma do page.tsx)
interface Cliente {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

// Props que o ClientForm vai receber do componente pai (ClientesPage)
interface ClientFormProps {
  onSubmit: (data: Partial<Cliente>) => Promise<void>; // Função para lidar com a submissão
  initialData?: Partial<Cliente> | null; // Dados iniciais para edição
  onCancelEdit?: () => void; // Função para cancelar edição
  isSubmitting: boolean; // Estado de submissão do formulário
  formError: string | null; // Erro do formulário
}

export default function ClientForm({
  onSubmit,
  initialData,
  onCancelEdit,
  isSubmitting,
  formError,
}: ClientFormProps) {
  const [formData, setFormData] = useState<Partial<Cliente>>(() => {
    const getInitialFormData = (data: Partial<Cliente> | null = null) => ({
      nome: data?.nome || "",
      email: data?.email || "",
      telefone: data?.telefone || "",
      cpf: data?.cpf || "",
      rg: data?.rg || "",
      dataNascimento: data?.dataNascimento
        ? new Date(data.dataNascimento).toISOString().split("T")[0]
        : "", // Formato YYYY-MM-DD
      endereco: data?.endereco || "",
      cidade: data?.cidade || "",
      estado: data?.estado || "",
      cep: data?.cep || "",
      observacoes: data?.observacoes || "",
    });
    return getInitialFormData(initialData);
  });

  useEffect(() => {
    const getInitialFormData = (data: Partial<Cliente> | null = null) => ({
      nome: data?.nome || "",
      email: data?.email || "",
      telefone: data?.telefone || "",
      cpf: data?.cpf || "",
      rg: data?.rg || "",
      dataNascimento: data?.dataNascimento
        ? new Date(data.dataNascimento).toISOString().split("T")[0]
        : "", // Formato YYYY-MM-DD
      endereco: data?.endereco || "",
      cidade: data?.cidade || "",
      estado: data?.estado || "",
      cep: data?.cep || "",
      observacoes: data?.observacoes || "",
    });
    setFormData(getInitialFormData(initialData));
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitInternal = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditing = !!initialData?.id;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
      {" "}
      {/* Estilo do contêiner */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {isEditing ? "Editar Cliente" : "Adicionar Novo Cliente"}
      </h2>
      <form onSubmit={handleSubmitInternal} className="flex flex-col">
        <div
          className="flex-grow overflow-y-auto pr-2"
          style={{ maxHeight: "60vh" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campos do Formulário (mantidos os mesmos, mas com foco na responsividade intrínseca) */}
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
                value={formData.nome || ""}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                value={formData.email || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                value={formData.telefone || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                value={formData.cpf || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                value={formData.rg || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                value={formData.dataNascimento || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                value={formData.endereco || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                value={formData.cidade || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                value={formData.estado || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                value={formData.cep || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="observacoes"
                className="block text-sm font-medium text-gray-700"
              >
                Observações:
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes || ""}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>
        </div>

        {formError && (
          <p className="md:col-span-2 text-red-600 text-sm mt-4">{formError}</p>
        )}

        {/* Botões de Ação */}
        <div className="mt-4 md:col-span-2 flex justify-end space-x-2">
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-full shadow-md hover:bg-gray-300 transition-colors duration-300 disabled:opacity-50"
              disabled={isSubmitting}
            >
              <XCircle size={18} /> Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-semibold py-2 px-5 rounded-full shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>{" "}
                Salvando...
              </>
            ) : isEditing ? (
              <>
                <Save size={18} /> Salvar Edição
              </>
            ) : (
              <>
                <Plus size={18} /> Adicionar Cliente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
