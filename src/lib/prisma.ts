// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Declara uma variável global para o PrismaClient
// Isso evita que novas instâncias do PrismaClient sejam criadas em cada hot-reload no desenvolvimento
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Reutiliza a instância global em desenvolvimento para evitar muitas conexões
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
