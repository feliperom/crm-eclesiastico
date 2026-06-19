"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { garantirAdmin } from "@/lib/auth/access";
import { CARGO } from "@/lib/constants";

const membroSchema = z.object({
  email: z.string().trim().min(3).refine((valor) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(valor), "E-mail inválido"),
  nome: z.string().trim().optional(),
  cargo: z.enum([CARGO.ADMIN, CARGO.LIDER_CELULA]),
});

export async function criarMembro(formData: FormData) {
  await garantirAdmin();
  const dados = membroSchema.parse({
    email: formData.get("email"),
    nome: formData.get("nome"),
    cargo: formData.get("cargo"),
  });
  const email = dados.email.toLowerCase();

  await prisma.membro.upsert({
    where: { email },
    update: { nome: dados.nome || "", cargo: dados.cargo },
    create: { email, nome: dados.nome || "", cargo: dados.cargo },
  });

  revalidatePath("/usuarios");
}

export async function excluirMembro(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  await prisma.membro.delete({ where: { id } });
  revalidatePath("/usuarios");
}
