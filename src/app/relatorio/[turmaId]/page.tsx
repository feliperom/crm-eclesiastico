import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calcularSituacao, SITUACAO_LABEL } from "@/lib/situacao";
import { formatarData } from "@/lib/format";
import { PrintButton } from "@/components/print-button";

export const dynamic = "force-dynamic";

export default async function RelatorioTurmaPage({ params }: { params: Promise<{ turmaId: string }> }) {
  const { turmaId } = await params;

  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    include: {
      modulo: { include: { nivel: true } },
      atribuicoes: { include: { materia: true, aulas: { orderBy: { data: "asc" } } } },
      matriculas: { include: { membro: true, presencas: true }, orderBy: { membro: { nome: "asc" } } },
    },
  });
  if (!turma) notFound();

  const aulas = turma.atribuicoes
    .flatMap((atribuicao) => atribuicao.aulas.map((aula) => ({ id: aula.id, data: aula.data, materia: atribuicao.materia.nome })))
    .sort((a, b) => a.data.getTime() - b.data.getTime());

  const linhas = turma.matriculas.map((matricula) => {
    const porAula = new Map(matricula.presencas.map((presenca) => [presenca.aulaId, presenca.presente]));
    const faltas = matricula.presencas.filter((presenca) => !presenca.presente).length;
    const situacao = calcularSituacao({
      faltas,
      maxFaltas: turma.modulo.maxFaltas,
      status: matricula.status,
      encerrada: turma.encerradaEm !== null,
    });
    return { nome: matricula.membro.nome, porAula, faltas, situacao };
  });

  return (
    <div className="relative z-10 min-h-dvh bg-canvas px-4 py-6 print:bg-white print:p-0">
      <div className="no-print mx-auto mb-6 flex max-w-6xl items-center justify-between">
        <Link href={`/turmas/${turmaId}`} className="text-sm font-semibold text-muted hover:text-ink">
          ← Voltar
        </Link>
        <PrintButton label="Imprimir folha" />
      </div>

      <div className="mx-auto max-w-6xl rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-sm print:rounded-none print:border-0 print:shadow-none">
        <header className="mb-5 border-b border-line pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Folha de frequência</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">{turma.nome}</h1>
          <p className="mt-1 text-sm text-muted">
            {turma.modulo.nivel.nome} · {turma.modulo.nome}
            {turma.periodo ? ` · ${turma.periodo}` : ""} · máx. {turma.modulo.maxFaltas} faltas · emitido em {formatarData(new Date())}
          </p>
        </header>

        {linhas.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Nenhum membro matriculado nesta turma.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="sticky left-0 bg-surface py-2 pr-3 font-semibold text-ink">Membro</th>
                  {aulas.map((aula) => (
                    <th key={aula.id} className="px-1.5 py-2 text-center text-[11px] font-medium text-muted" title={aula.materia}>
                      {formatarData(aula.data).slice(0, 5)}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center font-semibold text-ink">Faltas</th>
                  <th className="px-2 py-2 text-left font-semibold text-ink">Situação</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((linha, indice) => (
                  <tr key={indice} className="border-b border-line/70">
                    <td className="sticky left-0 bg-surface py-2 pr-3 font-medium text-ink">{linha.nome}</td>
                    {aulas.map((aula) => {
                      const registro = linha.porAula.get(aula.id);
                      const marca = registro === undefined ? "·" : registro ? "P" : "F";
                      const cor = registro === false ? "text-danger font-semibold" : registro ? "text-positive" : "text-muted/50";
                      return (
                        <td key={aula.id} className={`px-1.5 py-2 text-center ${cor}`}>
                          {marca}
                        </td>
                      );
                    })}
                    <td className={`px-2 py-2 text-center font-semibold ${linha.faltas > turma.modulo.maxFaltas ? "text-danger" : "text-ink"}`}>
                      {linha.faltas}
                    </td>
                    <td className="px-2 py-2 text-muted">{SITUACAO_LABEL[linha.situacao]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted">Legenda: P = presente · F = falta · · = sem registro</p>
          </div>
        )}
      </div>
    </div>
  );
}
