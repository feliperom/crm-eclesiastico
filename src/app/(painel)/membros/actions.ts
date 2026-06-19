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

export async function registrarEtapaTrilho(formData: FormData) {
  await garantirAdmin(); // no futuro pode ser LIDER_CELULA também
  const membroId = z.string().min(1).parse(formData.get("membroId"));
  const etapa = z.string().min(1).parse(formData.get("etapa"));
  
  await prisma.historicoTrilho.upsert({
    where: {
      membroId_etapa: { membroId, etapa }
    },
    update: {
      dataConclusao: new Date()
    },
    create: {
      membroId,
      etapa,
      dataConclusao: new Date()
    }
  });

  revalidatePath(`/membros/${membroId}`);
}

export async function removerEtapaTrilho(formData: FormData) {
  await garantirAdmin();
  const membroId = z.string().min(1).parse(formData.get("membroId"));
  const etapa = z.string().min(1).parse(formData.get("etapa"));

  await prisma.historicoTrilho.delete({
    where: {
      membroId_etapa: { membroId, etapa }
    }
  });

  revalidatePath(`/membros/${membroId}`);
}
