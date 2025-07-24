// src/components/AgendamentoForm.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Plus, Save, XCircle } from "lucide-react"; // Importa ícones para os botões

interface ClienteSimples {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
}

interface Agendamento {
  id: string;
  clienteId: string;
  cliente?: ClienteSimples;
  dataAgendamento: string;
  horaAgendamento: string;
  tipoAgendamento: string;
  observacoes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AgendamentoFormProps {
  onSubmit: (data: Partial<Agendamento>) => Promise<void>;
  initialData?: Partial<Agendamento> | null;
  onCancelEdit?: () => void;
  isSubmitting: boolean;
  formError: string | null;
  clientes: ClienteSimples[]; // Lista de clientes para o select
}

export default function AgendamentoForm({
  onSubmit,
  initialData,
  onCancelEdit,
  isSubmitting,
  formError,
  clientes,
}: AgendamentoFormProps) {
  const [formData, setFormData] = useState<Partial<Agendamento>>(
    () =>
      initialData || {
        clienteId: "",
        dataAgendamento: new Date().toISOString().split("T")[0], // Data atual por padrão
        horaAgendamento: "",
        tipoAgendamento: "",
        observacoes: "",
        status: "Pendente",
      }
  );

  useEffect(() => {
    if (initialData) {
      const formattedDate = initialData.dataAgendamento
        ? new Date(initialData.dataAgendamento).toISOString().split("T")[0]
        : "";
      setFormData({
        ...initialData,
        dataAgendamento: formattedDate,
      });
    } else {
      setFormData({
        clienteId: "",
        dataAgendamento: new Date().toISOString().split("T")[0],
        horaAgendamento: "",
        tipoAgendamento: "",
        observacoes: "",
        status: "Pendente",
      });
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitInternal = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditing = !!initialData?.id;

  // Opções para o tipo de agendamento
  const tipoAgendamentoOptions = [
    "Consulta",
    "Exame de Vista",
    "Retorno",
    "Ajuste",
    "Entrega",
  ];
  // Opções para o status do agendamento
  const statusOptions = ["Pendente", "Confirmado", "Realizado", "Cancelado"];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
      {" "}
      {/* Estilo do contêiner */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {isEditing ? "Editar Agendamento" : "Adicionar Novo Agendamento"}
      </h2>
      <form onSubmit={handleSubmitInternal} className="flex flex-col">
        <div
          className="flex-grow overflow-y-auto pr-2"
          style={{ maxHeight: "60vh" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {/* Data do Agendamento */}
            <div>
              <label
                htmlFor="dataAgendamento"
                className="block text-sm font-medium text-gray-700"
              >
                Data do Agendamento:
              </label>
              <input
                type="date"
                id="dataAgendamento"
                name="dataAgendamento"
                value={formData.dataAgendamento || ""}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Hora do Agendamento */}
            <div>
              <label
                htmlFor="horaAgendamento"
                className="block text-sm font-medium text-gray-700"
              >
                Hora do Agendamento:
              </label>
              <input
                type="time" // Input de hora
                id="horaAgendamento"
                name="horaAgendamento"
                value={formData.horaAgendamento || ""}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Tipo de Agendamento */}
            <div>
              <label
                htmlFor="tipoAgendamento"
                className="block text-sm font-medium text-gray-700"
              >
                Tipo de Agendamento:
              </label>
              <select
                id="tipoAgendamento"
                name="tipoAgendamento"
                value={formData.tipoAgendamento || ""}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione o tipo</option>
                {tipoAgendamentoOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            {/* Status do Agendamento (apenas em edição ou se quiser permitir na criação) */}
            {isEditing && ( // Mostra o status apenas em modo de edição
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status:
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* Observações */}
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
                <Plus size={18} /> Adicionar Agendamento
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
