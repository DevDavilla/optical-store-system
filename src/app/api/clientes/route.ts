// src/app/api/clientes/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany();
    return NextResponse.json(clientes, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json(); // Pega os dados enviados no corpo da requisição

    // Validar e criar o cliente no banco de dados
    const novoCliente = await prisma.cliente.create({
      data: {
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        cpf: body.cpf, // Adicionamos os novos campos
        rg: body.rg,
        dataNascimento: body.dataNascimento
          ? new Date(body.dataNascimento)
          : null, // Converte para Date se existir
        endereco: body.endereco,
        cidade: body.cidade,
        estado: body.estado,
        cep: body.cep,
        observacoes: body.observacoes,
      },
    });

    return NextResponse.json(novoCliente, { status: 201 }); // 201 Created
  } catch (error: any) {
    console.error("Erro ao criar cliente:", error);
    // Tratar erros de validação ou de banco de dados
    if (error.code === "P2002") {
      // Prisma error code for unique constraint violation
      return NextResponse.json(
        { message: "Email ou CPF já cadastrado." },
        { status: 409 }
      ); // 409 Conflict
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao criar cliente" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
