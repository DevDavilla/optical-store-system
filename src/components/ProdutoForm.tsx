"use client";

import React, { useState, useEffect } from "react";

// Definir os Enums como types para uso no frontend
type TipoProdutoEnum =
  | "Armacao"
  | "LenteDeGrau"
  | "LenteDeContato"
  | "Acessorio"
  | "Servico"
  | "Outro";
type TipoLenteGrauEnum =
  | "VisaoSimples"
  | "Multifocal"
  | "Bifocal"
  | "Ocupacional"
  | "Progressiva"
  | "Outro";
type MaterialLenteGrauEnum =
  | "Resina"
  | "Policarbonato"
  | "Cristal"
  | "Trivex"
  | "Outro";
type TipoDescarteLenteContatoEnum =
  | "Diario"
  | "Quinzenal"
  | "Mensal"
  | "Trimestral"
  | "Anual"
  | "Outro";

interface Produto {
  id: string;
  nome: string;
  tipo: TipoProdutoEnum;
  marca?: string;
  modelo?: string;
  quantidadeEmEstoque: number;
  precoCusto?: number;
  precoVenda?: number;
  fornecedor?: string;
  descricao?: string;
  sku?: string;

  // Campos específicos para Lente de Grau
  tipoLenteGrau?: TipoLenteGrauEnum;
  materialLenteGrau?: MaterialLenteGrauEnum;
  tratamentosLenteGrau?: string[]; // Array de strings
  grauEsfericoOD?: number;
  grauCilindricoOD?: number;
  grauEixoOD?: number;
  grauAdicaoOD?: number;
  grauEsfericoOE?: number;
  grauCilindricoOE?: number;
  grauEixoOE?: number;
  grauAdicaoOE?: number;
  fabricanteLaboratorio?: string;

  // Campos específicos para Lente de Contato
  curvaBaseLenteContato?: string;
  diametroLenteContato?: number;
  poderLenteContato?: number;
  tipoDescarteLenteContato?: TipoDescarteLenteContatoEnum;
  solucoesLenteContato?: string;

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
  const [formData, setFormData] = useState<Partial<Produto>>(() => {
    // Função auxiliar para criar o estado inicial com todos os campos
    const getInitialFormData = (data: Partial<Produto> | null = null) => ({
      nome: data?.nome || "",
      tipo: data?.tipo || ("" as TipoProdutoEnum), // Cast para o tipo Enum
      marca: data?.marca || "",
      modelo: data?.modelo || "",
      quantidadeEmEstoque: data?.quantidadeEmEstoque ?? 0,
      precoCusto: data?.precoCusto ?? undefined,
      precoVenda: data?.precoVenda ?? undefined,
      fornecedor: data?.fornecedor || "",
      descricao: data?.descricao || "",
      sku: data?.sku || "",

      // Lente de Grau
      tipoLenteGrau: data?.tipoLenteGrau || ("" as TipoLenteGrauEnum),
      materialLenteGrau:
        data?.materialLenteGrau || ("" as MaterialLenteGrauEnum),
      tratamentosLenteGrau: data?.tratamentosLenteGrau || [],
      grauEsfericoOD: data?.grauEsfericoOD ?? undefined,
      grauCilindricoOD: data?.grauCilindricoOD ?? undefined,
      grauEixoOD: data?.grauEixoOD ?? undefined,
      grauAdicaoOD: data?.grauAdicaoOD ?? undefined,
      grauEsfericoOE: data?.grauEsfericoOE ?? undefined,
      grauCilindricoOE: data?.grauCilindricoOE ?? undefined,
      grauEixoOE: data?.grauEixoOE ?? undefined,
      grauAdicaoOE: data?.grauAdicaoOE ?? undefined,
      fabricanteLaboratorio: data?.fabricanteLaboratorio || "",

      // Lente de Contato
      curvaBaseLenteContato: data?.curvaBaseLenteContato || "",
      diametroLenteContato: data?.diametroLenteContato ?? undefined,
      poderLenteContato: data?.poderLenteContato ?? undefined,
      tipoDescarteLenteContato:
        data?.tipoDescarteLenteContato || ("" as TipoDescarteLenteContatoEnum),
      solucoesLenteContato: data?.solucoesLenteContato || "",
    });

    return getInitialFormData(initialData);
  });

  useEffect(() => {
    // Atualiza o estado interno do formulário se initialData mudar (para edição)
    const getInitialFormData = (data: Partial<Produto> | null = null) => ({
      nome: data?.nome || "",
      tipo: data?.tipo || ("" as TipoProdutoEnum),
      marca: data?.marca || "",
      modelo: data?.modelo || "",
      quantidadeEmEstoque: data?.quantidadeEmEstoque ?? 0,
      precoCusto: data?.precoCusto ?? undefined,
      precoVenda: data?.precoVenda ?? undefined,
      fornecedor: data?.fornecedor || "",
      descricao: data?.descricao || "",
      sku: data?.sku || "",

      tipoLenteGrau: data?.tipoLenteGrau || ("" as TipoLenteGrauEnum),
      materialLenteGrau:
        data?.materialLenteGrau || ("" as MaterialLenteGrauEnum),
      tratamentosLenteGrau: data?.tratamentosLenteGrau || [],
      grauEsfericoOD: data?.grauEsfericoOD ?? undefined,
      grauCilindricoOD: data?.grauCilindricoOD ?? undefined,
      grauEixoOD: data?.grauEixoOD ?? undefined,
      grauAdicaoOD: data?.grauAdicaoOD ?? undefined,
      grauEsfericoOE: data?.grauEsfericoOE ?? undefined,
      grauCilindricoOE: data?.grauCilindricoOE ?? undefined,
      grauEixoOE: data?.grauEixoOE ?? undefined,
      grauAdicaoOE: data?.grauAdicaoOE ?? undefined,
      fabricanteLaboratorio: data?.fabricanteLaboratorio || "",

      curvaBaseLenteContato: data?.curvaBaseLenteContato || "",
      diametroLenteContato: data?.diametroLenteContato ?? undefined,
      poderLenteContato: data?.poderLenteContato ?? undefined,
      tipoDescarteLenteContato:
        data?.tipoDescarteLenteContato || ("" as TipoDescarteLenteContatoEnum),
      solucoesLenteContato: data?.solucoesLenteContato || "",
    });

    setFormData(getInitialFormData(initialData));
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    let newValue: string | number | string[] | undefined = value;

    if (type === "number") {
      newValue = value === "" ? undefined : parseFloat(value);
      if (name === "quantidadeEmEstoque" && value === "") {
        newValue = 0;
      }
    } else if (name === "tratamentosLenteGrau") {
      // Lida com checkboxes para tratamentos
      const currentTreatments = Array.isArray(formData.tratamentosLenteGrau)
        ? formData.tratamentosLenteGrau
        : [];
      if (checked) {
        newValue = [...currentTreatments, value];
      } else {
        newValue = currentTreatments.filter((t) => t !== value);
      }
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmitInternal = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditing = !!initialData?.id;

  const tipoProdutoOptions: TipoProdutoEnum[] = [
    "Armacao",
    "LenteDeGrau",
    "LenteDeContato",
    "Acessorio",
    "Servico",
    "Outro",
  ];
  const tipoLenteGrauOptions: TipoLenteGrauEnum[] = [
    "VisaoSimples",
    "Multifocal",
    "Bifocal",
    "Ocupacional",
    "Progressiva",
    "Outro",
  ];
  const materialLenteGrauOptions: MaterialLenteGrauEnum[] = [
    "Resina",
    "Policarbonato",
    "Cristal",
    "Trivex",
    "Outro",
  ];
  const tipoDescarteLenteContatoOptions: TipoDescarteLenteContatoEnum[] = [
    "Diario",
    "Quinzenal",
    "Mensal",
    "Trimestral",
    "Anual",
    "Outro",
  ];
  const tratamentosPossiveis = [
    "Antirreflexo",
    "Filtro Azul",
    "Proteção UV",
    "Hidrofóbico",
    "Fotossensível",
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 font-sans">
      {" "}
      {/* Aplicado rounded-2xl e shadow-xl para consistência */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {isEditing ? "Editar Produto" : "Adicionar Novo Produto"}
      </h2>
      <form
        onSubmit={handleSubmitInternal}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Campos Básicos do Produto */}
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" // Adicionado focus styles
          />
        </div>
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" // Adicionado focus styles
          >
            <option value="">Selecione o tipo</option>
            {tipoProdutoOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" // Adicionado focus styles
          />
        </div>
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" // Adicionado focus styles
          />
        </div>
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" // Adicionado focus styles
          />
        </div>
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
            value={formData.quantidadeEmEstoque ?? ""} // Alterado para "" para não exibir 0 por padrão
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" // Adicionado focus styles
          />
        </div>
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" // Adicionado focus styles
          />
        </div>
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" // Adicionado focus styles
          />
        </div>
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" // Adicionado focus styles
          />
        </div>
        <div className="lg:col-span-3">
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" // Adicionado focus styles
          ></textarea>
        </div>

        {/* --- Campos Condicionais para Lente de Grau --- */}
        {(formData.tipo === "LenteDeGrau" ||
          (isEditing && initialData?.tipo === "LenteDeGrau")) && (
          <div className="lg:col-span-3 border-t border-gray-200 pt-4 mt-4">
            {" "}
            {/* Adicionado border-gray-200 */}
            <h3 className="text-xl font-semibold mb-3 text-gray-700">
              Detalhes da Lente de Grau
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="tipoLenteGrau"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tipo de Lente:
                </label>
                <select
                  id="tipoLenteGrau"
                  name="tipoLenteGrau"
                  value={formData.tipoLenteGrau || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" // Adicionado focus styles
                >
                  <option value="">Selecione</option>
                  {tipoLenteGrauOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="materialLenteGrau"
                  className="block text-sm font-medium text-gray-700"
                >
                  Material:
                </label>
                <select
                  id="materialLenteGrau"
                  name="materialLenteGrau"
                  value={formData.materialLenteGrau || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" // Adicionado focus styles
                >
                  <option value="">Selecione</option>
                  {materialLenteGrauOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tratamentos:
                </label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {tratamentosPossiveis.map((tratamento) => (
                    <div key={tratamento} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`tratamento-${tratamento}`}
                        name="tratamentosLenteGrau"
                        value={tratamento}
                        checked={
                          formData.tratamentosLenteGrau?.includes(tratamento) ||
                          false
                        }
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" // Adicionado focus styles
                      />
                      <label
                        htmlFor={`tratamento-${tratamento}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {tratamento}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-md font-medium text-gray-600 mb-2">
                    Graus Olho Direito (OD)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="grauEsfericoOD"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Esférico:
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        id="grauEsfericoOD"
                        name="grauEsfericoOD"
                        value={formData.grauEsfericoOD ?? ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="grauCilindricoOD"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Cilíndrico:
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        id="grauCilindricoOD"
                        name="grauCilindricoOD"
                        value={formData.grauCilindricoOD ?? ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="grauEixoOD"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Eixo:
                      </label>
                      <input
                        type="number"
                        step="1"
                        id="grauEixoOD"
                        name="grauEixoOD"
                        value={formData.grauEixoOD ?? ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="grauAdicaoOD"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Adição:
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        id="grauAdicaoOD"
                        name="grauAdicaoOD"
                        value={formData.grauAdicaoOD ?? ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-600 mb-2">
                    Graus Olho Esquerdo (OE)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="grauEsfericoOE"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Esférico:
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        id="grauEsfericoOE"
                        name="grauEsfericoOE"
                        value={formData.grauEsfericoOE ?? ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="grauCilindricoOE"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Cilíndrico:
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        id="grauCilindricoOE"
                        name="grauCilindricoOE"
                        value={formData.grauCilindricoOE ?? ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="grauEixoOE"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Eixo:
                      </label>
                      <input
                        type="number"
                        step="1"
                        id="grauEixoOE"
                        name="grauEixoOE"
                        value={formData.grauEixoOE ?? ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="grauAdicaoOE"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Adição:
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        id="grauAdicaoOE"
                        name="grauAdicaoOE"
                        value={formData.grauAdicaoOE ?? ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label
                  htmlFor="fabricanteLaboratorio"
                  className="block text-sm font-medium text-gray-700"
                >
                  Fabricante/Laboratório:
                </label>
                <input
                  type="text"
                  id="fabricanteLaboratorio"
                  name="fabricanteLaboratorio"
                  value={formData.fabricanteLaboratorio || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- Campos Condicionais para Lente de Contato --- */}
        {(formData.tipo === "LenteDeContato" ||
          (isEditing && initialData?.tipo === "LenteDeContato")) && (
          <div className="lg:col-span-3 border-t border-gray-200 pt-4 mt-4">
            {" "}
            {/* Adicionado border-gray-200 */}
            <h3 className="text-xl font-semibold mb-3 text-gray-700">
              Detalhes da Lente de Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="curvaBaseLenteContato"
                  className="block text-sm font-medium text-gray-700"
                >
                  Curva Base:
                </label>
                <input
                  type="text"
                  id="curvaBaseLenteContato"
                  name="curvaBaseLenteContato"
                  value={formData.curvaBaseLenteContato || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="diametroLenteContato"
                  className="block text-sm font-medium text-gray-700"
                >
                  Diâmetro:
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="diametroLenteContato"
                  name="diametroLenteContato"
                  value={formData.diametroLenteContato ?? ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="poderLenteContato"
                  className="block text-sm font-medium text-gray-700"
                >
                  Poder (Grau):
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="poderLenteContato"
                  name="poderLenteContato"
                  value={formData.poderLenteContato ?? ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="tipoDescarteLenteContato"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tipo de Descarte:
                </label>
                <select
                  id="tipoDescarteLenteContato"
                  name="tipoDescarteLenteContato"
                  value={formData.tipoDescarteLenteContato || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione</option>
                  {tipoDescarteLenteContatoOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="solucoesLenteContato"
                  className="block text-sm font-medium text-gray-700"
                >
                  Soluções Compatíveis:
                </label>
                <input
                  type="text"
                  id="solucoesLenteContato"
                  name="solucoesLenteContato"
                  value={formData.solucoesLenteContato || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- Campos Condicionais para Serviço --- */}
        {(formData.tipo === "Servico" ||
          (isEditing && initialData?.tipo === "Servico")) && (
          <div className="lg:col-span-3 border-t border-gray-200 pt-4 mt-4">
            {" "}
            {/* Adicionado border-gray-200 */}
            <h3 className="text-xl font-semibold mb-3 text-gray-700">
              Detalhes do Serviço
            </h3>
            <p className="text-gray-600">
              Para serviços, o preço de venda é o valor do serviço.
            </p>
          </div>
        )}

        {formError && (
          <p className="lg:col-span-3 text-red-600 text-sm">{formError}</p>
        )}

        <div className="lg:col-span-3 flex justify-end space-x-2">
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-xl shadow-md disabled:opacity-50 transition-colors duration-200" // Cores e arredondamento padronizados
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-md disabled:opacity-50 transition-colors duration-200" // Cores e arredondamento padronizados
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
