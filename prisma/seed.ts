import { PrismaClient } from "@prisma/client";
import { APOSTILA_STATUS } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  // Reseed limpo para ambiente de desenvolvimento.
  await prisma.presenca.deleteMany();
  await prisma.aula.deleteMany();
  await prisma.matricula.deleteMany();
  await prisma.atribuicao.deleteMany();
  await prisma.turma.deleteMany();
  await prisma.materia.deleteMany();
  await prisma.modulo.deleteMany();
  await prisma.nivel.deleteMany();
  await prisma.professor.deleteMany();
  await prisma.historicoTrilho.deleteMany();
  await prisma.rede.deleteMany();
  await prisma.celula.deleteMany();
  await prisma.membro.deleteMany();

  // ── Currículo ───────────────────────────────────────────────────────────
  const nivel1 = await prisma.nivel.create({ data: { nome: "Nível 1", ordem: 1 } });
  const nivel2 = await prisma.nivel.create({ data: { nome: "Nível 2", ordem: 2 } });

  const modulo1A = await prisma.modulo.create({
    data: {
      nome: "Módulo 1A",
      ordem: 1,
      nivelId: nivel1.id,
      materias: {
        create: [
          { nome: "Fundamentos da Fé", ordem: 1 },
          { nome: "Bibliologia", ordem: 2 },
          { nome: "Vida Cristã", ordem: 3 },
        ],
      },
    },
    include: { materias: true },
  });

  await prisma.modulo.create({
    data: {
      nome: "Módulo 1B",
      ordem: 2,
      nivelId: nivel1.id,
      materias: {
        create: [
          { nome: "Panorama do Antigo Testamento", ordem: 1 },
          { nome: "Panorama do Novo Testamento", ordem: 2 },
          { nome: "Evangelismo", ordem: 3 },
        ],
      },
    },
  });

  await prisma.modulo.create({
    data: {
      nome: "Módulo 2A",
      ordem: 1,
      nivelId: nivel2.id,
      materias: {
        create: [
          { nome: "Hermenêutica", ordem: 1 },
          { nome: "Homilética", ordem: 2 },
          { nome: "Liderança Cristã", ordem: 3 },
        ],
      },
    },
  });

  // ── Professores ─────────────────────────────────────────────────────────
  const joao = await prisma.professor.create({ data: { nome: "Pr. João Almeida", telefone: "11999990001" } });
  const maria = await prisma.professor.create({ data: { nome: "Pra. Maria Souza", telefone: "11999990002" } });
  const pedro = await prisma.professor.create({ data: { nome: "Diác. Pedro Lima", telefone: "11999990003" } });

  // ── Oferta: uma turma do Módulo 1A ──────────────────────────────────────
  const turma = await prisma.turma.create({
    data: {
      nome: "Nível 1 — 2026.1",
      ano: 2026,
      periodo: "Domingos 9h",
      moduloId: modulo1A.id,
    },
  });

  const professoresPorMateria = [joao, maria, pedro];
  const atribuicoes = await Promise.all(
    modulo1A.materias.map((materia, indice) =>
      prisma.atribuicao.create({
        data: {
          turmaId: turma.id,
          materiaId: materia.id,
          professorId: professoresPorMateria[indice % professoresPorMateria.length].id,
        },
      }),
    ),
  );

  // ── Alunos + matrículas ─────────────────────────────────────────────────
  const dadosAlunos = [
    { nome: "Ana Clara Ribeiro", telefone: "11988880001", apostilaStatus: APOSTILA_STATUS.PAGO },
    { nome: "Bruno Carvalho", telefone: "11988880002", apostilaStatus: APOSTILA_STATUS.PENDENTE },
    { nome: "Carla Mendes", telefone: "11988880003", apostilaStatus: APOSTILA_STATUS.PAGO },
    { nome: "Daniel Figueiredo", telefone: "11988880004", apostilaStatus: APOSTILA_STATUS.ISENTO },
    { nome: "Eduarda Nunes", telefone: "11988880005", apostilaStatus: APOSTILA_STATUS.PENDENTE },
  ];

  const matriculas = [];
  for (const dados of dadosAlunos) {
    const membro = await prisma.membro.create({
      data: { nome: dados.nome, telefone: dados.telefone },
    });
    const matricula = await prisma.matricula.create({
      data: { membroId: membro.id, turmaId: turma.id, apostilaStatus: dados.apostilaStatus },
    });
    matriculas.push(matricula);
  }

  // ── Algumas aulas com presença para demonstrar o dashboard ──────────────
  const primeiraAtribuicao = atribuicoes[0];
  const indiceAlunoFaltante = 1; // Bruno falta para aparecer "em risco".
  const datasAula = [new Date("2026-02-01T09:00:00"), new Date("2026-02-08T09:00:00")];
  for (const data of datasAula) {
    const aula = await prisma.aula.create({
      data: { atribuicaoId: primeiraAtribuicao.id, data, tema: "Aula de Fundamentos" },
    });
    for (const [indice, matricula] of matriculas.entries()) {
      await prisma.presenca.create({
        data: { matriculaId: matricula.id, aulaId: aula.id, presente: indice !== indiceAlunoFaltante },
      });
    }
  }

  console.log("Seed concluído.");
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
