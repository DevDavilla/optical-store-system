import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    const result = await prisma.$queryRaw`SELECT 1+1`;
    console.log("Conexão com DB bem-sucedida:", result);
  } catch (error) {
    console.error("Erro na conexão com DB:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
