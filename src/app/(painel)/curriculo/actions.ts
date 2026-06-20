"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { garantirAdmin } from "@/lib/auth/access";

export async function criarNivel(formData: FormData) {
  await garantirAdmin();
  const nome = z.string().trim().min(1, "Informe o nome").parse(formData.get("nome"));
  const ordem = (await prisma.nivel.count()) + 1;
  await prisma.nivel.create({ data: { nome, ordem } });
  revalidatePath("/curriculo");
}

export async function editarNivel(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const nome = z.string().trim().min(1, "Informe o nome").parse(formData.get("nome"));
  await prisma.nivel.update({ where: { id }, data: { nome } });
  revalidatePath("/curriculo");
}

const moduloSchema = z.object({
  nivelId: z.string().min(1),
  nome: z.string().trim().min(1, "Informe o nome do módulo"),
  maxFaltas: z.coerce.number().int().min(0).max(50),
});

export async function criarModulo(formData: FormData) {
  await garantirAdmin();
  const dados = moduloSchema.parse({
    nivelId: formData.get("nivelId"),
    nome: formData.get("nome"),
    maxFaltas: formData.get("maxFaltas"),
  });
  const ordem = (await prisma.modulo.count({ where: { nivelId: dados.nivelId } })) + 1;
  await prisma.modulo.create({ data: { ...dados, ordem } });
  revalidatePath("/curriculo");
}

export async function editarModulo(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const nome = z.string().trim().min(1, "Informe o nome do módulo").parse(formData.get("nome"));
  const maxFaltas = z.coerce.number().int().min(0).max(50).parse(formData.get("maxFaltas"));
  await prisma.modulo.update({ where: { id }, data: { nome, maxFaltas } });
  revalidatePath("/curriculo");
}

const materiaSchema = z.object({
  moduloId: z.string().min(1),
  nome: z.string().trim().min(1, "Informe o nome da matéria"),
});

export async function criarMateria(formData: FormData) {
  await garantirAdmin();
  const dados = materiaSchema.parse({ moduloId: formData.get("moduloId"), nome: formData.get("nome") });
  const ordem = (await prisma.materia.count({ where: { moduloId: dados.moduloId } })) + 1;
  const materia = await prisma.materia.create({ data: { ...dados, ordem } });

  // Sincroniza a grade: a nova matéria entra automaticamente em todas as turmas
  // existentes deste módulo (sem professor, pronta para atribuir).
  const turmas = await prisma.turma.findMany({ where: { moduloId: dados.moduloId }, select: { id: true } });
  if (turmas.length > 0) {
    await prisma.atribuicao.createMany({
      data: turmas.map((turma) => ({ turmaId: turma.id, materiaId: materia.id })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/curriculo");
}

export async function editarMateria(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const nome = z.string().trim().min(1, "Informe o nome").parse(formData.get("nome"));
  await prisma.materia.update({ where: { id }, data: { nome } });
  revalidatePath("/curriculo");
}

export async function excluirMateria(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  await prisma.materia.delete({ where: { id } });
  revalidatePath("/curriculo");
}

export async function excluirModulo(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  await prisma.modulo.delete({ where: { id } });
  revalidatePath("/curriculo");
}

export async function excluirNivel(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  await prisma.nivel.delete({ where: { id } });
  revalidatePath("/curriculo");
}

const provaSchema = z.object({
  moduloId: z.string().min(1),
  nome: z.string().trim().min(1, "Informe o nome da prova"),
  notaMaxima: z.coerce.number().min(1).max(100),
});

export async function criarProva(formData: FormData) {
  await garantirAdmin();
  const dados = provaSchema.parse({
    moduloId: formData.get("moduloId"),
    nome: formData.get("nome"),
    notaMaxima: formData.get("notaMaxima"),
  });
  const materiaIds = formData.getAll("materiaIds").map(String).filter(Boolean);
  const ordem = (await prisma.prova.count({ where: { moduloId: dados.moduloId } })) + 1;

  await prisma.prova.create({
    data: {
      moduloId: dados.moduloId,
      nome: dados.nome,
      notaMaxima: dados.notaMaxima,
      ordem,
      materias: { create: materiaIds.map((materiaId) => ({ materiaId })) },
    },
  });

  revalidatePath("/curriculo");
}

export async function excluirProva(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  await prisma.prova.delete({ where: { id } });
  revalidatePath("/curriculo");
}

export async function editarProva(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const dados = provaSchema.omit({ moduloId: true }).parse({
    nome: formData.get("nome"),
    notaMaxima: formData.get("notaMaxima"),
  });
  const materiaIds = formData.getAll("materiaIds").map(String).filter(Boolean);

  await prisma.$transaction(async (tx) => {
    await tx.prova.update({ where: { id }, data: { nome: dados.nome, notaMaxima: dados.notaMaxima } });
    await tx.provaMateria.deleteMany({ where: { provaId: id } });
    if (materiaIds.length > 0) {
      await tx.provaMateria.createMany({
        data: materiaIds.map(materiaId => ({ provaId: id, materiaId }))
      });
    }
  });

  revalidatePath("/curriculo");
}
