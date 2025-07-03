"use client";

import React, { useState, useEffect } from "react";

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

interface ClientFormProps {
  onSubmit: (data: Partial<Cliente>) => Promise<void>;
  initialData?: Partial<Cliente> | null;
  onCancelEdit?: () => void;
  isSubmitting: boolean;
  formError: string | null;
}

export default function ClientForm({
  onSubmit,
  initialData,
  onCancelEdit,
  isSubmitting,
  formError,
}: ClientFormProps) {
  const [formData, setFormData] = useState<Partial<Cliente>>({
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

  useEffect(() => {
    if (initialData) {
      const formattedDate = initialData.dataNascimento
        ? new Date(initialData.dataNascimento).toISOString().split("T")[0]
        : "";
      setFormData({
        ...initialData,
        dataNascimento: formattedDate,
      });
    } else {
      setFormData({
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
    }
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
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto mb-12 transition-shadow hover:shadow-xl">
      <h2 className="text-3xl font-semibold text-gray-900 mb-6 tracking-tight">
        {isEditing ? "Editar Cliente" : "Adicionar Novo Cliente"}
      </h2>
      <form
        onSubmit={handleSubmitInternal}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        noValidate
      >
        {/** Campo Nome */}
        <div>
          <label
            htmlFor="nome"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            autoComplete="name"
            placeholder="Nome completo"
            value={formData.nome || ""}
            onChange={handleInputChange}
            required
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/** Email */}
        <div>
          <label
            htmlFor="email"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            placeholder="exemplo@email.com"
            value={formData.email || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/** Telefone */}
        <div>
          <label
            htmlFor="telefone"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Telefone
          </label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            autoComplete="tel"
            placeholder="(XX) XXXXX-XXXX"
            value={formData.telefone || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/** CPF */}
        <div>
          <label
            htmlFor="cpf"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            CPF
          </label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            placeholder="000.000.000-00"
            value={formData.cpf || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/** RG */}
        <div>
          <label
            htmlFor="rg"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            RG
          </label>
          <input
            type="text"
            id="rg"
            name="rg"
            placeholder="XX.XXX.XXX-X"
            value={formData.rg || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/** Data de Nascimento */}
        <div>
          <label
            htmlFor="dataNascimento"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Data de Nascimento
          </label>
          <input
            type="date"
            id="dataNascimento"
            name="dataNascimento"
            value={formData.dataNascimento || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/** Endereço (span 2 cols) */}
        <div className="md:col-span-2">
          <label
            htmlFor="endereco"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Endereço
          </label>
          <input
            type="text"
            id="endereco"
            name="endereco"
            placeholder="Rua, número, complemento"
            value={formData.endereco || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/** Cidade */}
        <div>
          <label
            htmlFor="cidade"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Cidade
          </label>
          <input
            type="text"
            id="cidade"
            name="cidade"
            placeholder="Cidade"
            value={formData.cidade || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/** Estado */}
        <div>
          <label
            htmlFor="estado"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Estado
          </label>
          <input
            type="text"
            id="estado"
            name="estado"
            placeholder="Estado"
            value={formData.estado || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/** CEP */}
        <div>
          <label
            htmlFor="cep"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            CEP
          </label>
          <input
            type="text"
            id="cep"
            name="cep"
            placeholder="00000-000"
            value={formData.cep || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/** Observações - textarea full width */}
        <div className="md:col-span-2">
          <label
            htmlFor="observacoes"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Observações
          </label>
          <textarea
            id="observacoes"
            name="observacoes"
            value={formData.observacoes || ""}
            onChange={handleInputChange}
            rows={4}
            placeholder="Observações adicionais"
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {formError && (
          <p className="md:col-span-2 text-red-600 text-sm font-medium select-none">
            {formError}
          </p>
        )}

        <div className="md:col-span-2 flex justify-end space-x-4 mt-4">
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-md bg-gray-400 hover:bg-gray-500 text-gray-900 font-semibold px-6 py-2 transition focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
              ? "Salvar Edição"
              : "Adicionar Cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}
