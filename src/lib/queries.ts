import { prisma } from "./prisma";
import { calcularSituacao } from "./situacao";
import { APOSTILA_STATUS } from "./constants";

export async function listarTurmas() {
  return prisma.turma.findMany({
    orderBy: [{ ativa: "desc" }, { ano: "desc" }, { nome: "asc" }],
    include: {
      modulo: { include: { nivel: true } },
      _count: { select: { matriculas: true } },
    },
  });
}

// Detalhe da turma com grade (matéria + professor) e alunos com faltas/situação
// já calculadas. Faltas = presenças marcadas como ausente em qualquer aula da turma.
export async function obterTurmaDetalhe(turmaId: string) {
  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    include: {
      modulo: { include: { nivel: true } },
      atribuicoes: {
        include: { materia: true, professor: true, _count: { select: { aulas: true } } },
        orderBy: { materia: { ordem: "asc" } },
      },
      matriculas: {
        include: {
          membro: true,
          certificado: true,
          _count: { select: { presencas: { where: { presente: false } } } },
        },
        orderBy: { membro: { nome: "asc" } },
      },
    },
  });

  if (!turma) return null;

  const encerrada = turma.encerradaEm !== null;
  const alunos = turma.matriculas.map((matricula) => {
    const faltas = matricula._count.presencas;
    const situacao = calcularSituacao({ faltas, maxFaltas: turma.modulo.maxFaltas, status: matricula.status, encerrada });
    return { matricula, faltas, situacao };
  });

  return { turma, encerrada, alunos };
}

export async function dadosDashboard() {
  const turmasAtivasCount = await prisma.turma.count({
    where: { ativa: true },
  });

  const totalMembros = await prisma.membro.count();

  // Buscar alunos com apostila pendente diretamente no banco
  const apostilasDB = await prisma.matricula.findMany({
    where: {
      apostilaStatus: APOSTILA_STATUS.PENDENTE,
      turma: { ativa: true },
    },
    select: {
      membro: { select: { nome: true, telefone: true } },
      turma: { select: { id: true, nome: true } },
    },
  });

  const apostilaPendente = apostilasDB.map((m) => ({
    membroNome: m.membro.nome,
    turmaNome: m.turma.nome,
    turmaId: m.turma.id,
    telefone: m.membro.telefone,
  }));

  // Para o risco de falta, o Prisma não consegue comparar relations counts diretamente
  // no `where` com uma coluna da tabela (maxFaltas). Por isso, trazemos apenas os dados mínimos
  // necessários (apenas matrículas de turmas ativas, sem campos pesados).
  const matriculasFaltasDB = await prisma.matricula.findMany({
    where: { turma: { ativa: true } },
    select: {
      membro: { select: { nome: true } },
      turma: { select: { id: true, nome: true, modulo: { select: { maxFaltas: true } } } },
      _count: { select: { presencas: { where: { presente: false } } } },
    },
  });

  const emRiscoFalta: { membroNome: string; turmaNome: string; turmaId: string; faltas: number; maxFaltas: number }[] = [];

  for (const m of matriculasFaltasDB) {
    const faltas = m._count.presencas;
    const maxFaltas = m.turma.modulo.maxFaltas;
    if (faltas >= maxFaltas) {
      emRiscoFalta.push({
        membroNome: m.membro.nome,
        turmaNome: m.turma.nome,
        turmaId: m.turma.id,
        faltas,
        maxFaltas,
      });
    }
  }

  return {
    turmasAtivas: turmasAtivasCount,
    totalMembros,
    emRiscoFalta,
    apostilaPendente,
  };
}

export async function obterMembroPorToken(token: string) {
  const membro = await prisma.membro.findUnique({
    where: { token },
    include: {
      matriculas: {
        include: {
          turma: { include: { modulo: { include: { nivel: true } } } },
          _count: { select: { presencas: { where: { presente: false } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!membro) return null;

  const matriculas = membro.matriculas.map((matricula) => {
    const faltas = matricula._count.presencas;
    const situacao = calcularSituacao({
      faltas,
      maxFaltas: matricula.turma.modulo.maxFaltas,
      status: matricula.status,
      encerrada: matricula.turma.encerradaEm !== null,
    });
    return { matricula, faltas, situacao };
  });

  return { membro, matriculas };
}
