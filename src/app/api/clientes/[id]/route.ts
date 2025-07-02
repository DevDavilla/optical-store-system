// src/app/api/clientes/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Função para obter um cliente específico por ID (GET /api/clientes/[id])
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // Pega o ID da URL dinâmica

    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      return NextResponse.json(
        { message: "Cliente não encontrado." },
        { status: 404 }
      ); // 404 Not Found
    }

    return NextResponse.json(cliente, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar cliente por ID:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Função para excluir um cliente por ID (DELETE /api/clientes/[id])
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // Pega o ID da URL dinâmica

    const clienteDeletado = await prisma.cliente.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Cliente excluído com sucesso!", cliente: clienteDeletado },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao excluir cliente:", error);
    if (error.code === "P2025") {
      // Prisma error code for record not found
      return NextResponse.json(
        { message: "Cliente não encontrado para exclusão." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao excluir cliente" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json(); // Pega os dados a serem atualizados do corpo da requisição

    // Prepara os dados para atualização, convertendo dataNascimento se existir
    const dataToUpdate: { [key: string]: any } = { ...body };
    if (dataToUpdate.dataNascimento) {
      dataToUpdate.dataNascimento = new Date(dataToUpdate.dataNascimento);
    }

    const clienteAtualizado = await prisma.cliente.update({
      where: { id },
      data: dataToUpdate, // Usa os dados do corpo da requisição
    });

    return NextResponse.json(clienteAtualizado, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao atualizar cliente:", error);
    if (error.code === "P2025") {
      // Prisma error code for record not found
      return NextResponse.json(
        { message: "Cliente não encontrado para atualização." },
        { status: 404 }
      );
    }
    if (error.code === "P2002") {
      // Unique constraint violation (e.g., duplicate email/CPF)
      return NextResponse.json(
        { message: "Email ou CPF já cadastrado para outro cliente." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao atualizar cliente" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
