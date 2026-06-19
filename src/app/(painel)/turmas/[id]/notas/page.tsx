import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { salvarNotas } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NotasPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ prova?: string }>;
}) {
  const { id } = await params;
  const { prova: provaQuery } = await searchParams;

  const turma = await prisma.turma.findUnique({
    where: { id },
    include: {
      modulo: { include: { provas: { orderBy: { ordem: "asc" } } } },
      matriculas: { include: { membro: true, notas: true }, orderBy: { membro: { nome: "asc" } } },
    },
  });
  if (!turma) notFound();

  const provas = turma.modulo.provas;
  const provaSelecionada = provas.find((p) => p.id === provaQuery) ?? provas[0];

  return (
    <div>
      <Link href={`/turmas/${turma.id}`} className="mb-2 inline-block text-sm text-muted">
        ← {turma.nome}
      </Link>
      <PageHeader titulo="Notas" descricao="Lançamento por prova — informativo, não afeta a aprovação" />

      {provas.length === 0 ? (
        <EmptyState
          titulo="Nenhuma prova neste módulo"
          descricao="Cadastre as provas do módulo em Currículo para lançar notas."
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {provas.map((p) => {
              const ativo = p.id === provaSelecionada?.id;
              return (
                <Link
                  key={p.id}
                  href={`/turmas/${turma.id}/notas?prova=${p.id}`}
                  className={`rounded-xl px-3 py-1.5 text-sm font-medium ${
                    ativo ? "bg-primary text-white" : "border border-line bg-surface text-ink hover:bg-surface-2"
                  }`}
                >
                  {p.nome}
                </Link>
              );
            })}
          </div>

          {provaSelecionada ? (
            <form action={salvarNotas}>
              <input type="hidden" name="provaId" value={provaSelecionada.id} />
              <input type="hidden" name="turmaId" value={turma.id} />
              <Card className="mb-4 p-0">
                <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-sm text-muted">
                  <span>{provaSelecionada.nome}</span>
                  <span>Nota máxima: {provaSelecionada.notaMaxima}</span>
                </div>
                <div className="divide-y divide-line">
                  {turma.matriculas.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-muted">Nenhum membro matriculado.</p>
                  ) : (
                    turma.matriculas.map((matricula) => {
                      const nota = matricula.notas.find((n) => n.provaId === provaSelecionada.id);
                      return (
                        <label key={matricula.id} className="flex items-center justify-between gap-3 px-4 py-3">
                          <span className="min-w-0 truncate text-sm font-medium text-ink">{matricula.membro.nome}</span>
                          <input
                            name={`nota_${matricula.id}`}
                            type="number"
                            step="0.5"
                            min={0}
                            max={provaSelecionada.notaMaxima}
                            defaultValue={nota ? nota.valor : ""}
                            placeholder="—"
                            className="w-20 rounded-lg border border-line bg-surface px-2 py-1.5 text-center text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                          />
                        </label>
                      );
                    })
                  )}
                </div>
              </Card>
              <Button type="submit">Salvar notas</Button>
            </form>
          ) : null}
        </>
      )}
    </div>
  );
}
