/*
  Warnings:

  - You are about to drop the column `grau_adicao_oe` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `grau_cilindrico_od` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `grau_cilindrico_oe` on the `produtos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "produtos" DROP COLUMN "grau_adicao_oe",
DROP COLUMN "grau_cilindrico_od",
DROP COLUMN "grau_cilindrico_oe",
ADD COLUMN     "od_cilindrico" DOUBLE PRECISION,
ADD COLUMN     "oe_adicao" DOUBLE PRECISION,
ADD COLUMN     "oe_cilindrico" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "vendas" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "data_venda" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valor_total" DOUBLE PRECISION NOT NULL,
    "status_pagamento" TEXT NOT NULL DEFAULT 'Pendente',
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_venda" (
    "id" TEXT NOT NULL,
    "venda_id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_venda_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_venda" ADD CONSTRAINT "itens_venda_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_venda" ADD CONSTRAINT "itens_venda_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
