"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { APOSTILA_STATUS, MATRICULA_STATUS } from "@/lib/constants";
import { calcularSituacao, certificadoElegivel } from "@/lib/situacao";
import { garantirAdmin, obterMembro } from "@/lib/auth/access";

// Turma encerrada congela os registros acadêmicos (presença, matrícula, grade).
async function turmaCongelada(turmaId: string): Promise<boolean> {
  const turma = await prisma.turma.findUnique({ where: { id: turmaId }, select: { encerradaEm: true } });
  return turma?.encerradaEm != null;
}

const turmaSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome da turma"),
  ano: z.coerce.number().int().min(2000).max(2100),
  periodo: z.string().trim().optional(),
  moduloId: z.string().trim().min(1, "Selecione o módulo"),
});

export async function criarTurma(formData: FormData) {
  await garantirAdmin();
  const dados = turmaSchema.parse({
    nome: formData.get("nome"),
    ano: formData.get("ano"),
    periodo: formData.get("periodo"),
    moduloId: formData.get("moduloId"),
  });

  // Ao abrir a turma, já cria a grade puxando as matérias do módulo (sem professor ainda).
  const materias = await prisma.materia.findMany({ where: { moduloId: dados.moduloId } });

  const turma = await prisma.turma.create({
    data: {
      nome: dados.nome,
      ano: dados.ano,
      periodo: dados.periodo || null,
      moduloId: dados.moduloId,
      atribuicoes: { create: materias.map((materia) => ({ materiaId: materia.id })) },
    },
  });

  revalidatePath("/turmas");
  redirect(`/turmas/${turma.id}`);
}

export async function definirProfessor(formData: FormData) {
  await garantirAdmin();
  const atribuicaoId = z.string().min(1).parse(formData.get("atribuicaoId"));
  const professorIdBruto = formData.get("professorId");
  const professorId = professorIdBruto && professorIdBruto !== "" ? String(professorIdBruto) : null;
  const turmaId = z.string().min(1).parse(formData.get("turmaId"));
  if (await turmaCongelada(turmaId)) return;

  await prisma.atribuicao.update({ where: { id: atribuicaoId }, data: { professorId } });
  revalidatePath(`/turmas/${turmaId}`);
}

export async function matricularMembro(formData: FormData) {
  await garantirAdmin();
  const turmaId = z.string().min(1).parse(formData.get("turmaId"));
  const membroId = z.string().min(1, "Selecione um membro").parse(formData.get("membroId"));
  if (await turmaCongelada(turmaId)) return;

  await prisma.matricula.upsert({
    where: { membroId_turmaId: { membroId, turmaId } },
    update: {},
    create: { membroId, turmaId },
  });

  revalidatePath(`/turmas/${turmaId}`);
}

export async function removerMatricula(formData: FormData) {
  await garantirAdmin();
  const matriculaId = z.string().min(1).parse(formData.get("matriculaId"));
  const turmaId = z.string().min(1).parse(formData.get("turmaId"));
  if (await turmaCongelada(turmaId)) return;

  await prisma.matricula.delete({ where: { id: matriculaId } });
  revalidatePath(`/turmas/${turmaId}`);
}

const apostilaSchema = z.enum([APOSTILA_STATUS.PENDENTE, APOSTILA_STATUS.PAGO, APOSTILA_STATUS.ISENTO]);

export async function definirApostila(formData: FormData) {
  await garantirAdmin();
  const matriculaId = z.string().min(1).parse(formData.get("matriculaId"));
  const turmaId = z.string().min(1).parse(formData.get("turmaId"));
  const apostilaStatus = apostilaSchema.parse(formData.get("apostilaStatus"));

  await prisma.matricula.update({ where: { id: matriculaId }, data: { apostilaStatus } });
  revalidatePath(`/turmas/${turmaId}`);
}

const matriculaStatusSchema = z.enum([MATRICULA_STATUS.CURSANDO, MATRICULA_STATUS.TRANCADO]);

export async function definirStatusMatricula(formData: FormData) {
  await garantirAdmin();
  const matriculaId = z.string().min(1).parse(formData.get("matriculaId"));
  const turmaId = z.string().min(1).parse(formData.get("turmaId"));
  const status = matriculaStatusSchema.parse(formData.get("status"));

  await prisma.matricula.update({ where: { id: matriculaId }, data: { status } });
  revalidatePath(`/turmas/${turmaId}`);
}

const editarTurmaSchema = z.object({
  turmaId: z.string().min(1),
  nome: z.string().trim().min(1, "Informe o nome da turma"),
  ano: z.coerce.number().int().min(2000).max(2100),
  periodo: z.string().trim().optional(),
  ativa: z.boolean(),
});

export async function editarTurma(formData: FormData) {
  await garantirAdmin();
  const dados = editarTurmaSchema.parse({
    turmaId: formData.get("turmaId"),
    nome: formData.get("nome"),
    ano: formData.get("ano"),
    periodo: formData.get("periodo"),
    ativa: formData.get("ativa") === "on",
  });

  await prisma.turma.update({
    where: { id: dados.turmaId },
    data: { nome: dados.nome, ano: dados.ano, periodo: dados.periodo || null, ativa: dados.ativa },
  });

  revalidatePath(`/turmas/${dados.turmaId}`);
  revalidatePath("/turmas");
}

// Puxa para a grade da turma qualquer matéria do módulo que ainda não esteja lá.
export async function sincronizarGrade(formData: FormData) {
  await garantirAdmin();
  const turmaId = z.string().min(1).parse(formData.get("turmaId"));
  if (await turmaCongelada(turmaId)) return;

  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    include: { modulo: { include: { materias: true } }, atribuicoes: { select: { materiaId: true } } },
  });
  if (!turma) return;

  const jaTem = new Set(turma.atribuicoes.map((atribuicao) => atribuicao.materiaId));
  const faltando = turma.modulo.materias.filter((materia) => !jaTem.has(materia.id));
  if (faltando.length > 0) {
    await prisma.atribuicao.createMany({
      data: faltando.map((materia) => ({ turmaId, materiaId: materia.id })),
      skipDuplicates: true,
    });
  }

  revalidatePath(`/turmas/${turmaId}`);
}

export async function excluirTurma(formData: FormData) {
  await garantirAdmin();
  const turmaId = z.string().min(1).parse(formData.get("turmaId"));
  await prisma.turma.delete({ where: { id: turmaId } });
  revalidatePath("/turmas");
  redirect("/turmas");
}

export async function encerrarTurma(formData: FormData) {
  await garantirAdmin();
  const turmaId = z.string().min(1).parse(formData.get("turmaId"));
  await prisma.turma.update({ where: { id: turmaId }, data: { encerradaEm: new Date(), ativa: false } });
  revalidatePath(`/turmas/${turmaId}`);
  revalidatePath("/turmas");
}

export async function reabrirTurma(formData: FormData) {
  await garantirAdmin();
  const turmaId = z.string().min(1).parse(formData.get("turmaId"));
  await prisma.turma.update({ where: { id: turmaId }, data: { encerradaEm: null, ativa: true } });
  revalidatePath(`/turmas/${turmaId}`);
  revalidatePath("/turmas");
}

// Lança as notas de uma prova para os membros da turma. Campo vazio remove a nota.
export async function salvarNotas(formData: FormData) {
  await garantirAdmin();
  const provaId = z.string().min(1).parse(formData.get("provaId"));
  const turmaId = z.string().min(1).parse(formData.get("turmaId"));

  const matriculas = await prisma.matricula.findMany({ where: { turmaId }, select: { id: true } });

  const operacoes: Prisma.PrismaPromise<unknown>[] = [];
  for (const matricula of matriculas) {
    const bruto = formData.get(`nota_${matricula.id}`);
    const texto = (bruto == null ? "" : String(bruto)).trim().replace(",", ".");
    if (texto === "") {
      operacoes.push(prisma.nota.deleteMany({ where: { provaId, matriculaId: matricula.id } }));
      continue;
    }
    const valor = Number(texto);
    if (Number.isNaN(valor)) continue;
    operacoes.push(
      prisma.nota.upsert({
        where: { provaId_matriculaId: { provaId, matriculaId: matricula.id } },
        update: { valor },
        create: { provaId, matriculaId: matricula.id, valor },
      }),
    );
  }
  await prisma.$transaction(operacoes);

  revalidatePath(`/turmas/${turmaId}/notas`);
  redirect(`/turmas/${turmaId}/notas?prova=${provaId}&salvo=1`);
}

// Registra o certificado (número sequencial + quem emitiu) e abre a folha para impressão.
export async function emitirCertificado(formData: FormData) {
  await garantirAdmin();
  const matriculaId = z.string().min(1).parse(formData.get("matriculaId"));

  const matricula = await prisma.matricula.findUnique({
    where: { id: matriculaId },
    include: {
      turma: { include: { modulo: true } },
      certificado: true,
      _count: { select: { presencas: { where: { presente: false } } } },
    },
  });
  if (!matricula) return;

  if (!matricula.certificado) {
    const faltas = matricula._count.presencas;
    const situacao = calcularSituacao({
      faltas,
      maxFaltas: matricula.turma.modulo.maxFaltas,
      status: matricula.status,
      encerrada: matricula.turma.encerradaEm !== null,
    });
    if (!certificadoElegivel(situacao, matricula.apostilaStatus)) return;

    const membro = await obterMembro();
    const ano = new Date().getFullYear();
    const total = await prisma.certificado.count();
    const numero = `EM-${ano}-${String(total + 1).padStart(4, "0")}`;
    await prisma.certificado.create({ data: { matriculaId, numero, emitidoPor: membro?.nome ?? "Coordenação" } });
  }

  redirect(`/certificado/${matriculaId}`);
}
