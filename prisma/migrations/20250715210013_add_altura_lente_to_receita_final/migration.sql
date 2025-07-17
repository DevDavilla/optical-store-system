/*
  Warnings:

  - You are about to drop the column `grau_adicao_od` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `grau_eixo_oe` on the `produtos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "produtos" DROP COLUMN "grau_adicao_od",
DROP COLUMN "grau_eixo_oe",
ADD COLUMN     "od_adicao" DOUBLE PRECISION,
ADD COLUMN     "oe_eixo" INTEGER;

-- AlterTable
ALTER TABLE "receitas" ADD COLUMN     "altura_lente" DOUBLE PRECISION;
