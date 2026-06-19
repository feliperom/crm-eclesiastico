"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { garantirAdmin } from "@/lib/auth/access";

async function turmaCongelada(turmaId: string): Promise<boolean> {
  const turma = await prisma.turma.findUnique({ where: { id: turmaId }, select: { encerradaEm: true } });
  return turma?.encerradaEm != null;
}

const novaAulaSchema = z.object({
  turmaId: z.string().min(1),
  atribuicaoId: z.string().min(1, "Selecione a matéria"),
  data: z.string().min(1, "Informe a data"),
  tema: z.string().trim().optional(),
});

export async function criarAula(formData: FormData) {
  await garantirAdmin();
  const dados = novaAulaSchema.parse({
    turmaId: formData.get("turmaId"),
    atribuicaoId: formData.get("atribuicaoId"),
    data: formData.get("data"),
    tema: formData.get("tema"),
  });
  if (await turmaCongelada(dados.turmaId)) redirect(`/turmas/${dados.turmaId}`);

  const aula = await prisma.aula.create({
    data: {
      atribuicaoId: dados.atribuicaoId,
      data: new Date(`${dados.data}T00:00:00`),
      tema: dados.tema || null,
    },
  });

  redirect(`/turmas/${dados.turmaId}/chamada/${aula.id}`);
}

// Salva a chamada inteira de uma vez. Presença é marcada por matrícula:
// quem vier marcado no formulário está presente; os demais, ausentes.
export async function salvarPresencas(formData: FormData) {
  await garantirAdmin();
  const aulaId = z.string().min(1).parse(formData.get("aulaId"));
  const turmaId = z.string().min(1).parse(formData.get("turmaId"));
  if (await turmaCongelada(turmaId)) redirect(`/turmas/${turmaId}`);

  const matriculas = await prisma.matricula.findMany({ where: { turmaId }, select: { id: true } });

  await prisma.$transaction(
    matriculas.map((matricula) => {
      const presente = formData.get(`presente_${matricula.id}`) === "on";
      return prisma.presenca.upsert({
        where: { matriculaId_aulaId: { matriculaId: matricula.id, aulaId } },
        update: { presente },
        create: { matriculaId: matricula.id, aulaId, presente },
      });
    }),
  );

  revalidatePath(`/turmas/${turmaId}`);
  redirect(`/turmas/${turmaId}?chamada=salva`);
}

export async function excluirAula(formData: FormData) {
  await garantirAdmin();
  const aulaId = z.string().min(1).parse(formData.get("aulaId"));
  const turmaId = z.string().min(1).parse(formData.get("turmaId"));
  if (await turmaCongelada(turmaId)) return;

  await prisma.aula.delete({ where: { id: aulaId } });
  revalidatePath(`/turmas/${turmaId}/chamada`);
}
