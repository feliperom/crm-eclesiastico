"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { garantirAdmin } from "@/lib/auth/access";

const membroSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome"),
  telefone: z.string().trim().optional(),
  email: z.string().trim().optional(),
});

export async function criarMembro(formData: FormData) {
  await garantirAdmin();
  const dados = membroSchema.parse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    email: formData.get("email"),
  });

  await prisma.membro.create({
    data: { nome: dados.nome, telefone: dados.telefone || null, email: dados.email || null },
  });

  revalidatePath("/membros");
}

export async function atualizarMembro(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const dados = membroSchema.parse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    email: formData.get("email"),
  });

  await prisma.membro.update({
    where: { id },
    data: { nome: dados.nome, telefone: dados.telefone || null, email: dados.email || null },
  });

  revalidatePath(`/membros/${id}`);
  revalidatePath("/membros");
}
