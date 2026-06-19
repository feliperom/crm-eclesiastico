"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { garantirAdmin } from "@/lib/auth/access";

const criarCelulaSchema = z.object({
  nome: z.string().trim().min(3, "Nome muito curto"),
  dia: z.string().trim().optional(),
  horario: z.string().trim().optional(),
  bairro: z.string().trim().optional(),
});

export async function criarCelula(formData: FormData) {
  await garantirAdmin();
  const dados = criarCelulaSchema.parse({
    nome: formData.get("nome"),
    dia: formData.get("dia") || undefined,
    horario: formData.get("horario") || undefined,
    bairro: formData.get("bairro") || undefined,
  });

  await prisma.celula.create({ data: dados });
  revalidatePath("/celulas");
}

export async function excluirCelula(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  await prisma.celula.delete({ where: { id } });
  revalidatePath("/celulas");
}

export async function definirLider(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const liderId = formData.get("liderId");

  await prisma.celula.update({
    where: { id },
    data: { liderId: liderId ? String(liderId) : null },
  });
  revalidatePath(`/celulas/${id}`);
  revalidatePath("/celulas");
}

export async function adicionarMembroCelula(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const membroId = z.string().min(1).parse(formData.get("membroId"));

  await prisma.membro.update({
    where: { id: membroId },
    data: { celulaId: id },
  });
  revalidatePath(`/celulas/${id}`);
}

export async function removerMembroCelula(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id")); // id da celula
  const membroId = z.string().min(1).parse(formData.get("membroId"));

  await prisma.membro.update({
    where: { id: membroId },
    data: { celulaId: null },
  });
  revalidatePath(`/celulas/${id}`);
}
