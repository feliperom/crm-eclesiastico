"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { garantirAdmin } from "@/lib/auth/access";
import { CARGO } from "@/lib/constants";

const promoverSchema = z.object({
  membroId: z.string().min(1),
  cargo: z.enum([CARGO.ADMIN, CARGO.LIDER_CELULA]),
});

export async function promoverMembro(formData: FormData) {
  await garantirAdmin();
  const dados = promoverSchema.parse({
    membroId: formData.get("membroId"),
    cargo: formData.get("cargo"),
  });

  await prisma.membro.update({
    where: { id: dados.membroId },
    data: { cargo: dados.cargo },
  });

  revalidatePath("/usuarios");
}

export async function revogarAcessoUsuario(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  await prisma.membro.update({
    where: { id },
    data: { cargo: CARGO.COMUM },
  });
  revalidatePath("/usuarios");
}
