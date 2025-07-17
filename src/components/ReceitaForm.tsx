// src/components/ReceitaForm.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Plus, Save, XCircle } from "lucide-react"; // Importa ícones para os botões

interface ClienteSimples {
  id: string;
  nome: string;
}

interface Receita {
  id: string;
  clienteId: string;
  cliente?: ClienteSimples;
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
  distanciaNauseaPupilar?: number;
  alturaLente?: number;
  createdAt: string;
  updatedAt: string;
}

interface ReceitaFormProps {
  onSubmit: (data: Partial<Receita>) => Promise<void>;
  initialData?: Partial<Receita> | null;
  onCancelEdit?: () => void;
  isSubmitting: boolean;
  formError: string | null;
  clientes: ClienteSimples[]; // Lista de clientes para o select
}

export default function ReceitaForm({
  onSubmit,
  initialData,
  onCancelEdit,
  isSubmitting,
  formError,
  clientes,
}: ReceitaFormProps) {
  const [formData, setFormData] = useState<Partial<Receita>>(
    () =>
      initialData || {
        clienteId: "",
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
        distanciaNauseaPupilar: undefined,
        alturaLente: undefined,
      }
  );

  useEffect(() => {
    if (initialData) {
      const formattedDate = initialData.dataReceita
        ? new Date(initialData.dataReceita).toISOString().split("T")[0]
        : "";
      setFormData({
        ...initialData,
        dataReceita: formattedDate,
        odEsferico: initialData.odEsferico ?? undefined,
        odCilindrico: initialData.odCilindrico ?? undefined,
        odEixo: initialData.odEixo ?? undefined,
        odAdicao: initialData.odAdicao ?? undefined,
        oeEsferico: initialData.oeEsferico ?? undefined,
        oeCilindrico: initialData.oeCilindrico ?? undefined,
        oeEixo: initialData.oeEixo ?? undefined,
        oeAdicao: initialData.oeAdicao ?? undefined,
        distanciaPupilar: initialData.distanciaPupilar ?? undefined,
        distanciaNauseaPupilar: initialData.distanciaNauseaPupilar ?? undefined,
        alturaLente: initialData.alturaLente ?? undefined,
      });
    } else {
      setFormData({
        clienteId: "",
        dataReceita: new Date().toISOString().split("T")[0],
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
        distanciaNauseaPupilar: undefined,
        alturaLente: undefined,
      });
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "number" && value !== ""
        ? parseFloat(value)
        : value === ""
        ? undefined
        : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
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
        {isEditing ? "Editar Receita" : "Adicionar Nova Receita"}
      </h2>
      <form onSubmit={handleSubmitInternal} className="flex flex-col">
        <div
          className="flex-grow overflow-y-auto pr-2"
          style={{ maxHeight: "60vh" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Campo Cliente (Select) */}
            <div>
              <label
                htmlFor="clienteId"
                className="block text-sm font-medium text-gray-700"
              >
                Cliente:
              </label>
              <select
                id="clienteId"
                name="clienteId"
                value={formData.clienteId || ""}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isEditing} // Não permite mudar o cliente em edição
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} ({cliente.telefone || cliente.email || "N/A"}
                    )
                  </option>
                ))}
              </select>
            </div>
            {/* Data da Receita */}
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
                value={formData.dataReceita || ""}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Seção Olho Direito (OD) */}
            <div className="lg:col-span-3">
              <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">
                Olho Direito (OD)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    value={formData.odEsferico ?? ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={formData.odCilindrico ?? ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={formData.odEixo ?? ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={formData.odAdicao ?? ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Seção Olho Esquerdo (OE) */}
            <div className="lg:col-span-3">
              <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">
                Olho Esquerdo (OE)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    value={formData.oeEsferico ?? ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={formData.oeCilindrico ?? ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={formData.oeEixo ?? ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={formData.oeAdicao ?? ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Distância Pupilar, DNP e Altura da Lente */}
            <div className="lg:col-span-3">
              <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">
                Outros Dados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    value={formData.distanciaPupilar ?? ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="distanciaNauseaPupilar"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Distância Naso-Pupilar (DNP):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="distanciaNauseaPupilar"
                    name="distanciaNauseaPupilar"
                    value={formData.distanciaNauseaPupilar ?? ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="alturaLente"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Altura da Lente:
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="alturaLente"
                    name="alturaLente"
                    value={formData.alturaLente ?? ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="lg:col-span-3">
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
          <p className="lg:col-span-3 text-red-600 text-sm mt-4">{formError}</p>
        )}

        {/* Botões de Ação */}
        <div className="mt-4 lg:col-span-3 flex justify-end space-x-2">
          {" "}
          {/* Alterado para lg:col-span-3 */}
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
                <Plus size={18} /> Adicionar Receita
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
