"use client";

import React from "react";

interface ClienteFormProps {
  formData: any;
  formError: string | null;
  isSubmitting: boolean;
  editingClientId: string | null;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function ClienteForm({
  formData,
  formError,
  isSubmitting,
  editingClientId,
  onChange,
  onSubmit,
  onCancel,
}: ClienteFormProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold mb-4">
        {editingClientId ? "Editar Cliente" : "Adicionar Novo Cliente"}
      </h2>
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {[
          { label: "Nome", name: "nome" },
          { label: "Email", name: "email" },
          { label: "Telefone", name: "telefone" },
          { label: "CPF", name: "cpf" },
          { label: "RG", name: "rg" },
          {
            label: "Data de Nascimento",
            name: "dataNascimento",
            type: "date",
          },
          { label: "Endereço", name: "endereco" },
          { label: "Cidade", name: "cidade" },
          { label: "Estado", name: "estado" },
          { label: "CEP", name: "cep" },
        ].map(({ label, name, type = "text" }) => (
          <div
            key={name}
            className={name === "endereco" ? "md:col-span-2" : ""}
          >
            <label
              htmlFor={name}
              className="block text-sm font-medium text-gray-700"
            >
              {label}:
            </label>
            <input
              type={type}
              id={name}
              name={name}
              value={formData[name] || ""}
              onChange={onChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        ))}

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
            onChange={onChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          ></textarea>
        </div>

        {formError && (
          <p className="md:col-span-2 text-red-600 text-sm">{formError}</p>
        )}

        <div className="md:col-span-2 flex justify-end space-x-2">
          {editingClientId && (
            <button
              type="button"
              onClick={onCancel}
              className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md shadow-sm"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-sm"
          >
            {isSubmitting
              ? "Salvando..."
              : editingClientId
              ? "Salvar Edição"
              : "Adicionar Cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}
