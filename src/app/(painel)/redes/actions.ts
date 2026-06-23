"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { garantirAdmin } from "@/lib/auth/access";
import { CARGO } from "@/lib/constants";

const criarRedeSchema = z.object({
  nome: z.string().trim().min(3, "Nome muito curto"),
});

export async function criarRede(formData: FormData) {
  await garantirAdmin();
  const dados = criarRedeSchema.parse({
    nome: formData.get("nome"),
  });

  await prisma.rede.create({ data: dados });
  revalidatePath("/redes");
}

export async function excluirRede(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  await prisma.rede.delete({ where: { id } });
  revalidatePath("/redes");
}

const editarRedeSchema = z.object({
  id: z.string().min(1),
  nome: z.string().trim().min(3, "Nome muito curto"),
});

export async function editarDadosRede(formData: FormData) {
  await garantirAdmin();
  const dados = editarRedeSchema.parse({
    id: formData.get("id"),
    nome: formData.get("nome"),
  });

  await prisma.rede.update({
    where: { id: dados.id },
    data: { nome: dados.nome },
  });

  revalidatePath(`/redes/${dados.id}`);
  revalidatePath("/redes");
}

export async function adicionarMembroRede(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const membroId = z.string().min(1).parse(formData.get("membroId"));

  // Redes possuem relacionamento N-para-N com membros.
  await prisma.rede.update({
    where: { id },
    data: {
      membros: {
        connect: { id: membroId }
      }
    },
  });
  revalidatePath(`/redes/${id}`);
}

export async function removerMembroRede(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const membroId = z.string().min(1).parse(formData.get("membroId"));

  await prisma.rede.update({
    where: { id },
    data: {
      membros: {
        disconnect: { id: membroId }
      }
    },
  });
  revalidatePath(`/redes/${id}`);
}

export async function adicionarLiderRede(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const liderId = z.string().min(1).parse(formData.get("liderId"));

  const membro = await prisma.membro.findUnique({ where: { id: liderId } });

  await prisma.rede.update({
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
  revalidatePath(`/redes/${id}`);
}

export async function removerLiderRede(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const liderId = z.string().min(1).parse(formData.get("liderId"));

  await prisma.rede.update({
    where: { id },
    data: {
      lideres: {
        disconnect: { id: liderId }
      }
    },
  });
  revalidatePath(`/redes/${id}`);
}
