-- prisma/migrations/<DATA_E_NOME_DA_SUA_MIGRACAO>/migration.sql

-- Cria os ENUMS primeiro (se já existirem, o PostgreSQL vai avisar, mas não vai falhar)
CREATE TYPE "TipoProdutoEnum" AS ENUM ('Armacao', 'LenteDeGrau', 'LenteDeContato', 'Acessorio', 'Servico', 'Outro');
CREATE TYPE "TipoLenteGrauEnum" AS ENUM ('VisaoSimples', 'Multifocal', 'Bifocal', 'Ocupacional', 'Progressiva', 'Outro');
CREATE TYPE "MaterialLenteGrauEnum" AS ENUM ('Resina', 'Policarbonato', 'Cristal', 'Trivex', 'Outro');
CREATE TYPE "TipoDescarteLenteContatoEnum" AS ENUM ('Diario', 'Quinzenal', 'Mensal', 'Trimestral', 'Anual', 'Outro');

-- Adiciona a nova coluna 'new_tipo' com o tipo ENUM
ALTER TABLE "produtos" ADD COLUMN "new_tipo" "TipoProdutoEnum";

-- Copia os dados da coluna 'tipo' antiga para 'new_tipo', fazendo a conversão
-- Mapeie seus valores existentes para os ENUMS.
-- O 'ELSE 'Outro'::"TipoProdutoEnum"' é um fallback para valores não mapeados.
UPDATE "produtos" SET "new_tipo" =
    CASE "tipo"
        WHEN 'Armação' THEN 'Armacao'::"TipoProdutoEnum"
        WHEN 'Lente de Grau' THEN 'LenteDeGrau'::"TipoProdutoEnum"
        WHEN 'Lente de Contato' THEN 'LenteDeContato'::"TipoProdutoEnum" -- <-- CORRIGIDO AQUI
        WHEN 'Acessório' THEN 'Acessorio'::"TipoProdutoEnum"
        WHEN 'Serviço' THEN 'Servico'::"TipoProdutoEnum"
        ELSE 'Outro'::"TipoProdutoEnum" -- Garante que todos os valores antigos tenham um mapeamento
    END;

-- Define a nova coluna 'new_tipo' como NOT NULL (se 'tipo' for obrigatória no schema.prisma)
ALTER TABLE "produtos" ALTER COLUMN "new_tipo" SET NOT NULL;

-- Remove a coluna 'tipo' antiga
ALTER TABLE "produtos" DROP COLUMN "tipo";

-- Renomeia a coluna 'new_tipo' para 'tipo'
ALTER TABLE "produtos" RENAME COLUMN "new_tipo" TO "tipo";

-- Adiciona todas as novas colunas detalhadas do modelo Produto
ALTER TABLE "produtos" ADD COLUMN "tipo_lente_grau" "TipoLenteGrauEnum",
ADD COLUMN "material_lente_grau" "MaterialLenteGrauEnum",
ADD COLUMN "tratamentos_lente_grau" TEXT[], -- Array de strings
ADD COLUMN "grau_esferico_od" DOUBLE PRECISION,
ADD COLUMN "grau_cilindrico_od" DOUBLE PRECISION,
ADD COLUMN "grau_eixo_od" INTEGER,
ADD COLUMN "grau_adicao_od" DOUBLE PRECISION,
ADD COLUMN "grau_esferico_oe" DOUBLE PRECISION,
ADD COLUMN "grau_cilindrico_oe" DOUBLE PRECISION,
ADD COLUMN "grau_eixo_oe" INTEGER,
ADD COLUMN "grau_adicao_oe" DOUBLE PRECISION,
ADD COLUMN "fabricante_laboratorio" TEXT,
ADD COLUMN "curva_base_lente_contato" TEXT,
ADD COLUMN "diametro_lente_contato" DOUBLE PRECISION,
ADD COLUMN "poder_lente_contato" DOUBLE PRECISION,
ADD COLUMN "tipo_descarte_lente_contato" "TipoDescarteLenteContatoEnum",
ADD COLUMN "solucoes_lente_contato" TEXT;
