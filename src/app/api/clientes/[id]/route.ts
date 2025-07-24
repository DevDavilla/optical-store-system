// src/app/api/clientes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"; // Importe NextRequest
import prisma from "@/lib/prisma"; // Importa a instância global do PrismaClient

// Função para obter um cliente específico por ID (GET /api/clientes/[id])
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // Acessa params diretamente

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        receitas: {
          orderBy: {
            dataReceita: "desc",
          },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { message: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar cliente por ID:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função para excluir um cliente por ID (DELETE /api/clientes/[id])
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
      return NextResponse.json(
        { message: "Cliente não encontrado para exclusão." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao excluir cliente" },
      { status: 500 }
    );
  }
}

// Função para atualizar um cliente por ID (PATCH /api/clientes/[id])
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const dataToUpdate: { [key: string]: any } = {};

    if (body.nome !== undefined) dataToUpdate.nome = body.nome;
    if (body.email !== undefined) dataToUpdate.email = body.email;
    if (body.telefone !== undefined) dataToUpdate.telefone = body.telefone;
    if (body.cpf !== undefined) dataToUpdate.cpf = body.cpf;
    if (body.rg !== undefined) dataToUpdate.rg = body.rg;
    if (body.dataNascimento !== undefined) {
      if (body.dataNascimento === "") {
        dataToUpdate.dataNascimento = null;
      } else {
        dataToUpdate.dataNascimento = new Date(body.dataNascimento);
      }
    }
    if (body.endereco !== undefined) dataToUpdate.endereco = body.endereco;
    if (body.cidade !== undefined) dataToUpdate.cidade = body.cidade;
    if (body.estado !== undefined) dataToUpdate.estado = body.estado;
    if (body.cep !== undefined) dataToUpdate.cep = body.cep;
    if (body.observacoes !== undefined)
      dataToUpdate.observacoes = body.observacoes;

    const clienteAtualizado = await prisma.cliente.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(clienteAtualizado, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao atualizar cliente:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Cliente não encontrado para atualização." },
        { status: 404 }
      );
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Email ou CPF já cadastrado para outro cliente." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Erro interno do servidor ao atualizar cliente" },
      { status: 500 }
    );
  }
}
