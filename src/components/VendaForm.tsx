// src/components/VendaForm.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react"; // Adicionado useMemo

interface ClienteSimples {
  id: string;
  nome: string;
}

interface ProdutoSimples {
  id: string;
  nome: string;
  precoVenda?: number;
  quantidadeEmEstoque: number;
  sku?: string; // Adicionado para pesquisa
}

interface ItemVendaForm {
  // Interface para o estado dos itens no formulário
  produtoId: string;
  quantidade: number;
  precoUnitario: number; // Preço no momento da adição ao item
  produtoNome?: string; // Para exibir no formulário
  produtoEstoque?: number; // Para exibir estoque disponível
  produtoSku?: string; // Para exibir SKU
}

interface Venda {
  id: string;
  clienteId: string;
  dataVenda: string;
  valorTotal: number;
  statusPagamento: string;
  observacoes?: string;
  itens: ItemVendaForm[]; // Itens da venda
}

interface VendaFormProps {
  onSubmit: (data: Partial<Venda>) => Promise<void>;
  initialData?: Partial<Venda> | null;
  onCancelEdit?: () => void;
  isSubmitting: boolean;
  formError: string | null;
  clientes: ClienteSimples[];
  produtos: ProdutoSimples[]; // Lista completa de produtos
}

export default function VendaForm({
  onSubmit,
  initialData,
  onCancelEdit,
  isSubmitting,
  formError,
  clientes,
  produtos,
}: VendaFormProps) {
  const [formData, setFormData] = useState<Partial<Venda>>(
    () =>
      initialData || {
        clienteId: "",
        dataVenda: new Date().toISOString().split("T")[0],
        statusPagamento: "Pendente",
        observacoes: "",
        itens: [],
      }
  );

  const [currentItem, setCurrentItem] = useState<ItemVendaForm>({
    produtoId: "",
    quantidade: 1,
    precoUnitario: 0,
  });
  const [productSearchTerm, setProductSearchTerm] = useState(""); // Estado para a pesquisa de produtos

  const valorTotalCalculado =
    formData.itens?.reduce(
      (sum, item) => sum + item.quantidade * item.precoUnitario,
      0
    ) || 0;

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        clienteId: initialData.clienteId,
        dataVenda: initialData.dataVenda
          ? new Date(initialData.dataVenda).toISOString().split("T")[0]
          : "",
        statusPagamento: initialData.statusPagamento,
        observacoes: initialData.observacoes,
        valorTotal: initialData.valorTotal,
        // Itens não são carregados no formulário de edição simples
      });
    } else {
      setFormData({
        clienteId: "",
        dataVenda: new Date().toISOString().split("T")[0],
        statusPagamento: "Pendente",
        observacoes: "",
        itens: [],
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

  const handleItemChange = (
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
        quantidade: 1,
      }));
    } else if (name === "quantidade" || name === "precoUnitario") {
      setCurrentItem((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setCurrentItem((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddItem = () => {
    if (
      !currentItem.produtoId ||
      currentItem.quantidade <= 0 ||
      currentItem.precoUnitario <= 0
    ) {
      alert("Selecione um produto, quantidade e preço unitário válidos.");
      return;
    }
    const productInStock = produtos.find((p) => p.id === currentItem.produtoId);
    if (
      productInStock &&
      currentItem.quantidade > productInStock.quantidadeEmEstoque
    ) {
      alert(
        `Estoque insuficiente para ${productInStock.nome}. Disponível: ${productInStock.quantidadeEmEstoque}, Solicitado: ${currentItem.quantidade}.`
      );
      return;
    }

    const existingItemIndex = formData.itens?.findIndex(
      (item) => item.produtoId === currentItem.produtoId
    );

    if (existingItemIndex !== undefined && existingItemIndex > -1) {
      const updatedItems = [...(formData.itens || [])];
      const existingItem = updatedItems[existingItemIndex];
      const newQuantity = existingItem.quantidade + currentItem.quantidade;
      const newSubtotal = newQuantity * currentItem.precoUnitario;

      if (productInStock && newQuantity > productInStock.quantidadeEmEstoque) {
        alert(
          `Estoque insuficiente para ${productInStock.nome} ao adicionar mais. Total: ${newQuantity}, Disponível: ${productInStock.quantidadeEmEstoque}`
        );
        return;
      }

      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantidade: newQuantity,
        subtotal: newSubtotal,
      };
      setFormData((prev) => ({ ...prev, itens: updatedItems }));
    } else {
      const newItem: ItemVendaForm = {
        ...currentItem,
        subtotal: currentItem.quantidade * currentItem.precoUnitario,
        produtoNome: produtos.find((p) => p.id === currentItem.produtoId)?.nome,
        produtoSku: produtos.find((p) => p.id === currentItem.produtoId)?.sku, // Adicionado SKU
      };
      setFormData((prev) => ({
        ...prev,
        itens: [...(prev.itens || []), newItem],
      }));
    }

    setCurrentItem({ produtoId: "", quantidade: 1, precoUnitario: 0 });
    setProductSearchTerm(""); // Limpa a pesquisa após adicionar
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = formData.itens?.filter((_, i) => i !== index) || [];
    setFormData((prev) => ({ ...prev, itens: updatedItems }));
  };

  const handleSubmitInternal = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, valorTotal: valorTotalCalculado });
  };

  const isEditing = !!initialData?.id;

  const statusPagamentoOptions = ["Pendente", "Pago", "Parcelado", "Cancelado"];

  // Lógica de filtragem de produtos para o select
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {isEditing ? "Editar Venda" : "Registrar Nova Venda"}
      </h2>
      <form
        onSubmit={handleSubmitInternal}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Cliente da Venda */}
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            disabled={isEditing}
          >
            <option value="">Selecione um cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome} ({cliente.telefone || cliente.email || "N/A"})
              </option>
            ))}
          </select>
        </div>
        {/* Data da Venda */}
        {!isEditing && (
          <div>
            <label
              htmlFor="dataVenda"
              className="block text-sm font-medium text-gray-700"
            >
              Data da Venda:
            </label>
            <input
              type="date"
              id="dataVenda"
              name="dataVenda"
              value={
                formData.dataVenda || new Date().toISOString().split("T")[0]
              }
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              disabled
            />
          </div>
        )}
        {/* Status do Pagamento */}
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
            value={formData.statusPagamento || "Pendente"}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            {statusPagamentoOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {/* Observações */}
        <div className="md:col-span-2 lg:col-span-3">
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          ></textarea>
        </div>

        {/* --- Seção de Itens da Venda (Apenas para Nova Venda) --- */}
        {!isEditing && (
          <div className="lg:col-span-3 border-t pt-4 mt-4">
            <h3 className="text-xl font-semibold mb-3 text-gray-700">
              Adicionar Produtos à Venda
            </h3>
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
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
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
                  value={currentItem.produtoId || ""}
                  onChange={handleItemChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Selecione um produto</option>
                  {filteredProducts.map(
                    (
                      produto // Usando produtos filtrados
                    ) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} {produto.sku ? `(${produto.sku})` : ""}{" "}
                        (Estoque: {produto.quantidadeEmEstoque}) - R${" "}
                        {produto.precoVenda?.toFixed(2) || "N/A"}
                      </option>
                    )
                  )}
                </select>
                {currentItem.produtoId &&
                  currentItem.produtoEstoque !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                      Estoque disponível: {currentItem.produtoEstoque}
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
                  value={currentItem.quantidade}
                  onChange={handleItemChange}
                  min="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
                  value={currentItem.precoUnitario}
                  onChange={handleItemChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              {/* Botão Adicionar Item */}
              <div className="md:col-span-4">
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
            {formData.itens && formData.itens.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-2 text-gray-700">
                  Itens na Venda:
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-2 px-3 text-left text-sm font-semibold text-gray-600">
                          Produto
                        </th>
                        <th className="py-2 px-3 text-left text-sm font-semibold text-gray-600">
                          Qtd
                        </th>
                        <th className="py-2 px-3 text-left text-sm font-semibold text-gray-600">
                          Preço Unit.
                        </th>
                        <th className="py-2 px-3 text-left text-sm font-semibold text-gray-600">
                          Subtotal
                        </th>
                        <th className="py-2 px-3 text-left text-sm font-semibold text-gray-600">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.itens.map((item, index) => (
                        <tr key={item.produtoId || index} className="border-t">
                          {/* Usar produtoId como key se disponível */}
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
                            {(item.quantidade * item.precoUnitario).toFixed(2)}
                          </td>
                          <td className="py-2 px-3">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
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
        )}

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
            className="mt-4 w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
              ? "Salvar Edição"
              : "Registrar Venda"}
          </button>
        </div>
      </form>
    </div>
  );
}
