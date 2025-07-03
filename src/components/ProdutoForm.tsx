// src/components/ProdutoForm.tsx

"use client";

import React, { useState, useEffect } from "react";

interface Produto {
  id: string;
  nome: string;
  tipo: string;
  marca?: string;
  modelo?: string;
  quantidadeEmEstoque: number;
  precoCusto?: number;
  precoVenda?: number;
  fornecedor?: string;
  descricao?: string;
  sku?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProdutoFormProps {
  onSubmit: (data: Partial<Produto>) => Promise<void>;
  initialData?: Partial<Produto> | null;
  onCancelEdit?: () => void;
  isSubmitting: boolean;
  formError: string | null;
}

export default function ProdutoForm({
  onSubmit,
  initialData,
  onCancelEdit,
  isSubmitting,
  formError,
}: ProdutoFormProps) {
  const [formData, setFormData] = useState<Partial<Produto>>(
    () =>
      initialData || {
        nome: "",
        tipo: "",
        marca: "",
        modelo: "",
        quantidadeEmEstoque: 0,
        precoCusto: undefined,
        precoVenda: undefined,
        fornecedor: "",
        descricao: "",
        sku: "",
      }
  );

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Garante que valores numéricos sejam tratados corretamente para o input
        quantidadeEmEstoque: initialData.quantidadeEmEstoque ?? 0,
        precoCusto: initialData.precoCusto ?? undefined,
        precoVenda: initialData.precoVenda ?? undefined,
      });
    } else {
      setFormData({
        nome: "",
        tipo: "",
        marca: "",
        modelo: "",
        quantidadeEmEstoque: 0,
        precoCusto: undefined,
        precoVenda: undefined,
        fornecedor: "",
        descricao: "",
        sku: "",
      });
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    // Para campos numéricos, converte para número ou undefined/0 se vazio
    let newValue: string | number | undefined = value;
    if (type === "number") {
      newValue = value === "" ? undefined : parseFloat(value);
      if (name === "quantidadeEmEstoque" && value === "") {
        newValue = 0; // Quantidade pode ser 0, mas não undefined
      }
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmitInternal = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditing = !!initialData?.id;

  // Opções para o tipo de produto
  const tipoProdutoOptions = [
    "Armação",
    "Lente de Grau",
    "Lente de Contato",
    "Acessório",
    "Outro",
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {isEditing ? "Editar Produto" : "Adicionar Novo Produto"}
      </h2>
      <form
        onSubmit={handleSubmitInternal}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Nome do Produto */}
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        {/* Tipo de Produto */}
        <div>
          <label
            htmlFor="tipo"
            className="block text-sm font-medium text-gray-700"
          >
            Tipo:
          </label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo || ""}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Selecione o tipo</option>
            {tipoProdutoOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {/* Marca */}
        <div>
          <label
            htmlFor="marca"
            className="block text-sm font-medium text-gray-700"
          >
            Marca:
          </label>
          <input
            type="text"
            id="marca"
            name="marca"
            value={formData.marca || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        {/* Modelo */}
        <div>
          <label
            htmlFor="modelo"
            className="block text-sm font-medium text-gray-700"
          >
            Modelo:
          </label>
          <input
            type="text"
            id="modelo"
            name="modelo"
            value={formData.modelo || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        {/* SKU */}
        <div>
          <label
            htmlFor="sku"
            className="block text-sm font-medium text-gray-700"
          >
            SKU:
          </label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={formData.sku || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        {/* Quantidade em Estoque */}
        <div>
          <label
            htmlFor="quantidadeEmEstoque"
            className="block text-sm font-medium text-gray-700"
          >
            Quantidade em Estoque:
          </label>
          <input
            type="number"
            step="1"
            id="quantidadeEmEstoque"
            name="quantidadeEmEstoque"
            value={formData.quantidadeEmEstoque ?? 0}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        {/* Preço de Custo */}
        <div>
          <label
            htmlFor="precoCusto"
            className="block text-sm font-medium text-gray-700"
          >
            Preço de Custo:
          </label>
          <input
            type="number"
            step="0.01"
            id="precoCusto"
            name="precoCusto"
            value={formData.precoCusto ?? ""}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        {/* Preço de Venda */}
        <div>
          <label
            htmlFor="precoVenda"
            className="block text-sm font-medium text-gray-700"
          >
            Preço de Venda:
          </label>
          <input
            type="number"
            step="0.01"
            id="precoVenda"
            name="precoVenda"
            value={formData.precoVenda ?? ""}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        {/* Fornecedor */}
        <div>
          <label
            htmlFor="fornecedor"
            className="block text-sm font-medium text-gray-700"
          >
            Fornecedor:
          </label>
          <input
            type="text"
            id="fornecedor"
            name="fornecedor"
            value={formData.fornecedor || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        {/* Descrição */}
        <div className="lg:col-span-3">
          {" "}
          {/* Ocupa todas as colunas */}
          <label
            htmlFor="descricao"
            className="block text-sm font-medium text-gray-700"
          >
            Descrição:
          </label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao || ""}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          ></textarea>
        </div>

        {formError && (
          <p className="lg:col-span-3 text-red-600 text-sm">{formError}</p>
        )}

        <div className="lg:col-span-3 flex justify-end space-x-2">
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
              ? "Salvar Edição"
              : "Adicionar Produto"}
          </button>
        </div>
      </form>
    </div>
  );
}
