"use client";

import React, { useState, useEffect, useMemo } from "react";

// Interfaces para os dados do Cliente e Receita
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
  distanciaNauseaPupilar?: number;
  alturaLente?: number;
}

// --- NOVAS INTERFACES PARA VENDA ---
interface ProdutoSimples {
  id: string;
  nome: string;
  precoVenda?: number;
  quantidadeEmEstoque: number;
  sku?: string;
}

interface ItemVendaForm {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  produtoNome?: string;
  produtoEstoque?: number;
  produtoSku?: string;
}

interface VendaFormPropsData {
  statusPagamento: string;
  observacoes?: string;
  itens: ItemVendaForm[];
  valorTotal: number; // Adicionado para consistência
}

// Props que o formulário combinado vai receber do componente pai
interface CombinedFormProps {
  onSubmit: (data: {
    cliente: Partial<Cliente>;
    receita: Partial<Receita>;
    venda: Partial<VendaFormPropsData>;
  }) => Promise<void>;
  isSubmitting: boolean;
  formError: string | null;
  setFormError: React.Dispatch<React.SetStateAction<string | null>>; // Adicionado para gerenciar erros de item
  produtos: ProdutoSimples[]; // Lista de produtos para seleção
}

export default function CombinedClientRecipeForm({
  onSubmit,
  isSubmitting,
  formError,
  setFormError, // Recebe a função para atualizar o erro do formulário
  produtos,
}: CombinedFormProps) {
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
    cidade: "",
    cep: "",
    observacoes: "",
  });

  const [recipeData, setRecipeData] = useState<Partial<Receita>>({
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

  const [saleData, setSaleData] = useState<Partial<VendaFormPropsData>>({
    statusPagamento: "Pendente",
    observacoes: "",
    itens: [],
  });

  const [currentSaleItem, setCurrentItem] = useState<ItemVendaForm>({
    produtoId: "",
    quantidade: 1,
    precoUnitario: 0,
  });
  const [productSearchTerm, setProductSearchTerm] = useState("");

  // Calcula o valor total dos itens da venda
  const valorTotalCalculado = useMemo(
    () =>
      saleData.itens?.reduce(
        (sum, item) => sum + item.quantidade * item.precoUnitario,
        0
      ) || 0,
    [saleData.itens]
  );

  const handleClientInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setClientData((prev) => ({ ...prev, [name]: value }));
    setFormError(null); // Limpa o erro ao digitar
  };

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
    setFormError(null); // Limpa o erro ao digitar
  };

  const handleSaleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setSaleData((prev) => ({ ...prev, [name]: value }));
    setFormError(null); // Limpa o erro ao digitar
  };

  const handleCurrentItemChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    if (name === "produtoId") {
      const selectedProduct = produtos.find((p) => p.id === value);
      setCurrentItem((prev) => ({
        ...prev,
        produtoId: value,
        precoUnitario: selectedProduct?.precoVenda ?? 0,
        produtoNome: selectedProduct?.nome,
        produtoEstoque: selectedProduct?.quantidadeEmEstoque,
        produtoSku: selectedProduct?.sku,
        quantidade: 1, // Resetar quantidade ao mudar o produto
      }));
    } else if (name === "quantidade" || name === "precoUnitario") {
      setCurrentItem((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setCurrentItem((prev) => ({ ...prev, [name]: value }));
    }
    setFormError(null); // Limpa o erro ao digitar
  };

  const handleAddItem = () => {
    setFormError(null); // Limpa erros anteriores antes de adicionar

    if (
      !currentSaleItem.produtoId ||
      currentSaleItem.quantidade <= 0 ||
      currentSaleItem.precoUnitario <= 0
    ) {
      setFormError(
        "Por favor, selecione um produto, quantidade e preço unitário válidos para adicionar o item."
      );
      return;
    }
    const productInStock = produtos.find(
      (p) => p.id === currentSaleItem.produtoId
    );
    if (
      productInStock &&
      currentSaleItem.quantidade > productInStock.quantidadeEmEstoque
    ) {
      setFormError(
        `Estoque insuficiente para ${productInStock.nome}. Disponível: ${productInStock.quantidadeEmEstoque}, Solicitado: ${currentSaleItem.quantidade}.`
      );
      return;
    }

    const existingItemIndex = saleData.itens?.findIndex(
      (item) => item.produtoId === currentSaleItem.produtoId
    );

    if (existingItemIndex !== undefined && existingItemIndex > -1) {
      const updatedItems = [...(saleData.itens || [])];
      const existingItem = updatedItems[existingItemIndex];
      const newQuantity = existingItem.quantidade + currentSaleItem.quantidade;

      if (productInStock && newQuantity > productInStock.quantidadeEmEstoque) {
        setFormError(
          `Estoque insuficiente para ${productInStock.nome} ao adicionar mais. Total: ${newQuantity}, Disponível: ${productInStock.quantidadeEmEstoque}`
        );
        return;
      }

      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantidade: newQuantity,
      };
      setSaleData((prev) => ({ ...prev, itens: updatedItems }));
    } else {
      const newItem: ItemVendaForm = {
        ...currentSaleItem,
        produtoNome: produtos.find((p) => p.id === currentSaleItem.produtoId)
          ?.nome,
        produtoSku: produtos.find((p) => p.id === currentSaleItem.produtoId)
          ?.sku,
      };
      setSaleData((prev) => ({
        ...prev,
        itens: [...(prev.itens || []), newItem],
      }));
    }

    // Resetar campos de adição de item após adicionar
    setCurrentItem({ produtoId: "", quantidade: 1, precoUnitario: 0 });
    setProductSearchTerm("");
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = saleData.itens?.filter((_, i) => i !== index) || [];
    setSaleData((prev) => ({ ...prev, itens: updatedItems }));
    setFormError(null); // Limpa o erro ao remover item
  };

  const handleSubmitInternal = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Limpa erros antes de submeter

    if (!clientData.nome || !clientData.cpf) {
      setFormError("Nome e CPF do cliente são obrigatórios.");
      return;
    }
    if (!recipeData.dataReceita) {
      setFormError("A Data da Receita é obrigatória.");
      return;
    }
    if (saleData.itens?.length === 0) {
      setFormError("É necessário adicionar pelo menos um item à venda.");
      return;
    }

    onSubmit({
      cliente: clientData,
      receita: recipeData,
      venda: { ...saleData, valorTotal: valorTotalCalculado },
    });
  };

  const filteredProducts = useMemo(() => {
    if (!productSearchTerm) {
      return produtos;
    }
    const lowerCaseSearchTerm = productSearchTerm.toLowerCase();
    return produtos.filter(
      (produto) =>
        produto.nome.toLowerCase().includes(lowerCaseSearchTerm) ||
        (produto.sku && produto.sku.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [produtos, productSearchTerm]);

  const statusPagamentoOptions = ["Pendente", "Pago", "Parcelado", "Cancelado"];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 font-sans">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Cadastrar Novo Cliente, Receita e Venda
      </h2>
      <form
        onSubmit={handleSubmitInternal}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Seção de Dados do Cliente */}
        <div className="lg:col-span-3 border-b border-gray-200 pb-4 mb-4">
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
                value={clientData.email || ""}
                onChange={handleClientInputChange}
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
                value={clientData.telefone || ""}
                onChange={handleClientInputChange}
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
                value={clientData.cpf || ""}
                onChange={handleClientInputChange}
                required
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
                value={clientData.rg || ""}
                onChange={handleClientInputChange}
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
                value={clientData.dataNascimento || ""}
                onChange={handleClientInputChange}
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
                value={clientData.endereco || ""}
                onChange={handleClientInputChange}
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
                value={clientData.cidade || ""}
                onChange={handleClientInputChange}
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
                value={clientData.estado || ""}
                onChange={handleClientInputChange}
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
                value={clientData.cep || ""}
                onChange={handleClientInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Seção de Dados da Receita */}
        <div className="lg:col-span-3 border-b border-gray-200 pb-4 mb-4">
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={recipeData.odCilindrico ?? ""}
                    onChange={handleRecipeInputChange}
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
                    value={recipeData.odEixo ?? ""}
                    onChange={handleRecipeInputChange}
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
                    value={recipeData.odAdicao ?? ""}
                    onChange={handleRecipeInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={recipeData.oeCilindrico ?? ""}
                    onChange={handleRecipeInputChange}
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
                    value={recipeData.oeEixo ?? ""}
                    onChange={handleRecipeInputChange}
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
                    value={recipeData.oeAdicao ?? ""}
                    onChange={handleRecipeInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Distância Pupilar, DNP e Altura da Lente */}
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
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mt-4">
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
                  value={recipeData.distanciaNauseaPupilar ?? ""}
                  onChange={handleRecipeInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mt-4">
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
                  value={recipeData.alturaLente ?? ""}
                  onChange={handleRecipeInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Dados da Venda */}
        <div className="lg:col-span-3 border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">
            Dados da Venda
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="statusPagamento"
                className="block text-sm font-medium text-gray-700"
              >
                Status do Pagamento:
              </label>
              <select
                id="statusPagamento"
                name="statusPagamento"
                value={saleData.statusPagamento || "Pendente"}
                onChange={handleSaleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusPagamentoOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="observacoesVenda"
                className="block text-sm font-medium text-gray-700"
              >
                Observações da Venda:
              </label>
              <textarea
                id="observacoesVenda"
                name="observacoes"
                value={saleData.observacoes || ""}
                onChange={handleSaleInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            {/* Seção de Adicionar Produtos à Venda */}
            <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-4">
              <h4 className="text-lg font-medium mt-4 mb-3 text-gray-700">
                Adicionar Produtos à Venda
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Campo de pesquisa de produtos */}
                <div className="md:col-span-4">
                  <label
                    htmlFor="productSearch"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Pesquisar Produto:
                  </label>
                  <input
                    type="text"
                    id="productSearch"
                    placeholder="Buscar por nome ou SKU..."
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                  />
                </div>

                {/* Seleção de Produto */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="produtoId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Produto:
                  </label>
                  <select
                    id="produtoId"
                    name="produtoId"
                    value={currentSaleItem.produtoId || ""}
                    onChange={handleCurrentItemChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione um produto</option>
                    {filteredProducts.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} {produto.sku ? `(${produto.sku})` : ""}{" "}
                        (Estoque: {produto.quantidadeEmEstoque}) - R${" "}
                        {produto.precoVenda?.toFixed(2) || "N/A"}
                      </option>
                    ))}
                  </select>
                  {currentSaleItem.produtoId &&
                    currentSaleItem.produtoEstoque !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        Estoque disponível: {currentSaleItem.produtoEstoque}
                      </p>
                    )}
                </div>
                {/* Quantidade */}
                <div>
                  <label
                    htmlFor="quantidade"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Quantidade:
                  </label>
                  <input
                    type="number"
                    id="quantidade"
                    name="quantidade"
                    value={currentSaleItem.quantidade}
                    onChange={handleCurrentItemChange}
                    min="1"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {/* Preço Unitário */}
                <div>
                  <label
                    htmlFor="precoUnitario"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Preço Unitário:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="precoUnitario"
                    name="precoUnitario"
                    value={currentSaleItem.precoUnitario}
                    onChange={handleCurrentItemChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {/* Botão Adicionar Item */}
                <div className="md:col-span-4 flex justify-end">
                  {" "}
                  {/* Adicionado flex justify-end para alinhar o botão */}
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-semibold py-2 px-5 rounded-full shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    Adicionar Item
                  </button>
                </div>
              </div>
              {/* Tabela de Itens Adicionados */}
              {saleData.itens && saleData.itens.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl shadow-inner border border-gray-200">
                  <h4 className="text-lg font-medium mb-2 text-gray-700">
                    Itens na Venda:
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-2 px-3 text-left text-sm font-semibold text-gray-700">
                            Produto
                          </th>
                          <th className="py-2 px-3 text-left text-sm font-semibold text-gray-700">
                            Qtd
                          </th>
                          <th className="py-2 px-3 text-left text-sm font-semibold text-gray-700">
                            Preço Unit.
                          </th>
                          <th className="py-2 px-3 text-left text-sm font-semibold text-gray-700">
                            Subtotal
                          </th>
                          <th className="py-2 px-3 text-left text-sm font-semibold text-gray-700">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {saleData.itens.map((item, index) => (
                          <tr
                            key={item.produtoId || index}
                            className="border-t border-gray-100 even:bg-white odd:bg-gray-50"
                          >
                            <td className="py-2 px-3 text-gray-800">
                              {item.produtoNome}{" "}
                              {item.produtoSku ? `(${item.produtoSku})` : ""}
                            </td>
                            <td className="py-2 px-3 text-gray-800">
                              {item.quantidade}
                            </td>
                            <td className="py-2 px-3 text-gray-800">
                              R$ {item.precoUnitario.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-gray-800">
                              R${" "}
                              {(item.quantidade * item.precoUnitario).toFixed(
                                2
                              )}
                            </td>
                            <td className="py-2 px-3">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200"
                              >
                                Remover
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-right text-xl font-bold text-gray-800 mt-4">
                    Valor Total: R$ {valorTotalCalculado.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {formError && (
          <p className="lg:col-span-3 text-red-600 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-200">
            {formError}
          </p>
        )}

        <div className="lg:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-semibold py-2 px-5 rounded-full shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting
              ? "Cadastrando..."
              : "Cadastrar Cliente, Receita e Venda"}
          </button>
        </div>
      </form>
    </div>
  );
}
