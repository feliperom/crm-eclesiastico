"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { garantirAdmin } from "@/lib/auth/access";

const professorSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome"),
  telefone: z.string().trim().optional(),
  email: z.string().trim().optional(),
});

export async function criarProfessor(formData: FormData) {
  await garantirAdmin();
  const dados = professorSchema.parse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    email: formData.get("email"),
  });

  await prisma.professor.create({
    data: { nome: dados.nome, telefone: dados.telefone || null, email: dados.email || null },
  });

  revalidatePath("/professores");
}

export async function excluirProfessor(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  await prisma.professor.delete({ where: { id } });
  revalidatePath("/professores");
}
