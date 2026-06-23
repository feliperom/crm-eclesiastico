"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { garantirAdmin, garantirLideranca, verificarDonoCelula } from "@/lib/auth/access";
import { CARGO } from "@/lib/constants";

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

export async function editarDadosCelula(formData: FormData) {
  await garantirLideranca();
  const id = z.string().min(1).parse(formData.get("id"));
  
  const isDono = await verificarDonoCelula(id);
  if (!isDono) throw new Error("Sem permissão para alterar esta célula");

  const dados = criarCelulaSchema.parse({
    nome: formData.get("nome"),
    dia: formData.get("dia") || undefined,
    horario: formData.get("horario") || undefined,
    bairro: formData.get("bairro") || undefined,
  });

  await prisma.celula.update({
    where: { id },
    data: {
      nome: dados.nome,
      dia: dados.dia || null,
      horario: dados.horario || null,
      bairro: dados.bairro || null,
    },
  });

  revalidatePath(`/celulas/${id}`);
  revalidatePath("/celulas");
}

export async function excluirCelula(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  await prisma.celula.delete({ where: { id } });
  revalidatePath("/celulas");
}

export async function adicionarLiderCelula(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const liderId = z.string().min(1).parse(formData.get("liderId"));

  const membro = await prisma.membro.findUnique({ where: { id: liderId } });
  
  await prisma.celula.update({
    where: { id },
    data: {
      lideres: {
        connect: { id: liderId }
      }
    },
  });

  if (membro && membro.cargo === CARGO.COMUM) {
    await prisma.membro.update({
      where: { id: liderId },
      data: { cargo: CARGO.LIDER_CELULA },
    });
  }
  revalidatePath(`/celulas/${id}`);
  revalidatePath("/celulas");
}

export async function removerLiderCelula(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const liderId = z.string().min(1).parse(formData.get("liderId"));

  await prisma.celula.update({
    where: { id },
    data: {
      lideres: {
        disconnect: { id: liderId }
      }
    },
  });
  revalidatePath(`/celulas/${id}`);
  revalidatePath("/celulas");
}

export async function adicionarMembroCelula(formData: FormData) {
  await garantirLideranca();
  const id = z.string().min(1).parse(formData.get("id"));
  const membroId = z.string().min(1).parse(formData.get("membroId"));

  const isDono = await verificarDonoCelula(id);
  if (!isDono) throw new Error("Sem permissão para alterar esta célula");

  await prisma.membro.update({
    where: { id: membroId },
    data: { celulaId: id },
  });
  revalidatePath(`/celulas/${id}`);
}

export async function removerMembroCelula(formData: FormData) {
  await garantirLideranca();
  const id = z.string().min(1).parse(formData.get("id")); // id da celula
  const membroId = z.string().min(1).parse(formData.get("membroId"));

  const isDono = await verificarDonoCelula(id);
  if (!isDono) throw new Error("Sem permissão para alterar esta célula");

  await prisma.membro.update({
    where: { id: membroId },
    data: { celulaId: null },
  });
  revalidatePath(`/celulas/${id}`);
}
