"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { garantirAdmin } from "@/lib/auth/access";

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
