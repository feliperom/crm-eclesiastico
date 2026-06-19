import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calcularSituacao } from "@/lib/situacao";
import { obterBaseUrl } from "@/lib/base-url";
import { linkWhatsApp, formatarData } from "@/lib/format";
import { APOSTILA_STATUS_LABEL, ETAPAS_TRILHO_ORDEM, ETAPA_TRILHO_LABEL, type ApostilaStatus } from "@/lib/constants";
import { Badge, Card, EmptyState, Field, Input, PageHeader, SituacaoBadge } from "@/components/ui";
import { CopiarLink } from "@/components/copiar-link";
import { atualizarMembro, registrarEtapaTrilho, removerEtapaTrilho } from "../actions";
import { garantirLideranca, verificarPertenceCelula } from "@/lib/auth/access";
import { CARGO } from "@/lib/constants";

export default async function MembroDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const membro = await prisma.membro.findUnique({
    where: { id },
    include: {
      historicoTrilho: true,
      matriculas: {
        include: {
          turma: { include: { modulo: { include: { nivel: true } } } },
          notas: { include: { prova: true } },
          _count: { select: { presencas: { where: { presente: false } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!membro) notFound();

  const membroLogado = await garantirLideranca();
  const isAdmin = membroLogado.cargo === CARGO.ADMIN;

  if (!isAdmin) {
    const pertence = await verificarPertenceCelula(membro.id);
    if (!pertence) notFound();
  }

  const baseUrl = await obterBaseUrl();
  const linkPortal = `${baseUrl}/membro/${membro.token}`;
  const wpp = linkWhatsApp(
    membro.telefone,
    `Olá, ${membro.nome}! Aqui você acompanha sua frequência e situação na Escola Ministerial: ${linkPortal}`,
  );

  return (
    <div>
      <Link href="/membros" className="mb-2 inline-block text-sm text-muted">
        ← Membros
      </Link>
      <PageHeader titulo={membro.nome} descricao={membro.telefone ?? undefined} />

      {/* Link público (link mágico, sem senha) */}
      <Card className="mb-5">
        <h2 className="mb-2 text-sm font-semibold text-ink">Página do membro</h2>
        <p className="mb-2 text-xs text-muted">Compartilhe este link — o membro acompanha tudo sem precisar de senha.</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={linkPortal}
            className="min-w-0 flex-1 rounded-lg border border-line bg-surface-2 px-2 py-2 text-xs text-muted"
          />
          <CopiarLink url={linkPortal} />
        </div>
        {wpp ? (
          <a
            href={wpp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Enviar pelo WhatsApp
          </a>
        ) : null}
      </Card>

      {/* Jornada (Trilho) */}
      <h2 className="mt-8 mb-3 text-sm font-semibold text-ink">Jornada (Trilho)</h2>
      <div className="mb-8 space-y-3">
        {ETAPAS_TRILHO_ORDEM.map((etapa) => {
          const historico = membro.historicoTrilho.find((h) => h.etapa === etapa);
          const concluido = !!historico;
          return (
            <Card key={etapa} className={`flex items-center justify-between ${concluido ? "border-primary/30 bg-primary/5" : ""}`}>
              <div className="flex items-center gap-3">
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${concluido ? "bg-primary text-white" : "bg-surface-2 text-muted"}`}>
                  {concluido ? "✓" : ""}
                </div>
                <div>
                  <p className={`font-medium ${concluido ? "text-ink" : "text-muted"}`}>{ETAPA_TRILHO_LABEL[etapa]}</p>
                  {concluido && (
                    <p className="text-xs text-muted">Concluído em {formatarData(historico.dataConclusao)}</p>
                  )}
                </div>
              </div>
              {concluido ? (
                <form action={removerEtapaTrilho}>
                  <input type="hidden" name="membroId" value={membro.id} />
                  <input type="hidden" name="etapa" value={etapa} />
                  <button type="submit" className="text-xs font-semibold text-muted hover:text-danger hover:underline">
                    Desfazer
                  </button>
                </form>
              ) : (
                <form action={registrarEtapaTrilho}>
                  <input type="hidden" name="membroId" value={membro.id} />
                  <input type="hidden" name="etapa" value={etapa} />
                  <button type="submit" className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-line">
                    Registrar
                  </button>
                </form>
              )}
            </Card>
          );
        })}
      </div>

      {/* Histórico Escolar */}
      <h2 className="mb-3 text-sm font-semibold text-ink">Histórico da Escola Ministerial</h2>
      {membro.matriculas.length === 0 ? (
        <EmptyState titulo="Sem matrículas" descricao="Matricule o membro em uma turma." />
      ) : (
        <div className="mb-5 space-y-2">
          {membro.matriculas.map((matricula) => {
            const faltas = matricula._count.presencas;
            const situacao = calcularSituacao({
              faltas,
              maxFaltas: matricula.turma.modulo.maxFaltas,
              status: matricula.status,
              encerrada: matricula.turma.encerradaEm !== null,
            });
            return (
              <Card key={matricula.id}>
                <Link href={`/turmas/${matricula.turmaId}`}>
                  <p className="font-medium text-ink">{matricula.turma.nome}</p>
                  <p className="text-sm text-muted">
                    {matricula.turma.modulo.nivel.nome} · {matricula.turma.modulo.nome}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <SituacaoBadge situacao={situacao} />
                    <Badge>{faltas} falta(s)</Badge>
                    <Badge>Apostila: {APOSTILA_STATUS_LABEL[matricula.apostilaStatus as ApostilaStatus]}</Badge>
                  </div>
                </Link>
                {matricula.notas.length > 0 ? (
                  <div className="mt-3 border-t border-line pt-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Boletim</p>
                    <ul className="space-y-0.5">
                      {[...matricula.notas]
                        .sort((a, b) => a.prova.ordem - b.prova.ordem)
                        .map((nota) => (
                          <li key={nota.id} className="flex justify-between text-sm text-ink">
                            <span>{nota.prova.nome}</span>
                            <span className="font-medium">
                              {nota.valor} <span className="text-muted">/ {nota.prova.notaMaxima}</span>
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      {/* Editar dados */}
      {isAdmin && (
        <details className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <summary className="cursor-pointer text-sm font-semibold text-primary">Editar dados</summary>
          <form action={atualizarMembro} className="mt-4 space-y-3">
            <input type="hidden" name="id" value={membro.id} />
            <Field label="Nome">
              <Input name="nome" defaultValue={membro.nome} required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Telefone (WhatsApp)">
                <Input name="telefone" defaultValue={membro.telefone ?? ""} inputMode="tel" />
              </Field>
              <Field label="E-mail">
                <Input name="email" type="email" defaultValue={membro.email ?? ""} />
              </Field>
            </div>
            <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
              Salvar
            </button>
          </form>
        </details>
      )}
    </div>
  );
}
