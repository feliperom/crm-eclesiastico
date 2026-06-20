import { notFound } from "next/navigation";
import { obterMembroPorToken } from "@/lib/queries";
import { faltasRestantes, certificadoElegivel } from "@/lib/situacao";
import { APOSTILA_STATUS_LABEL, type ApostilaStatus } from "@/lib/constants";
import { SituacaoBadge } from "@/components/ui";

export default async function PortalMembroPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const dados = await obterMembroPorToken(token);
  if (!dados) notFound();

  const { membro, matriculas } = dados;

  return (
    <div className="mx-auto min-h-dvh max-w-xl px-4 py-8">
      <header className="mb-6">
        <p className="text-sm font-medium text-primary">Gestão Eclesiástica</p>
        <h1 className="text-2xl font-bold text-ink">Olá, {membro.nome.split(" ")[0]}!</h1>
        <p className="text-sm text-muted">Acompanhe sua frequência e situação por aqui.</p>
      </header>

      {matriculas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-muted">
          Você ainda não está matriculado em nenhuma turma.
        </div>
      ) : (
        <div className="space-y-4">
          {matriculas.map(({ matricula, faltas, situacao }) => {
            const maxFaltas = matricula.turma.modulo.maxFaltas;
            const restantes = faltasRestantes(faltas, maxFaltas);
            const liberado = certificadoElegivel(situacao, matricula.apostilaStatus);
            return (
              <div key={matricula.id} className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{matricula.turma.nome}</p>
                    <p className="text-sm text-muted">
                      {matricula.turma.modulo.nivel.nome} · {matricula.turma.modulo.nome}
                    </p>
                  </div>
                  <SituacaoBadge situacao={situacao} />
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-surface-2 p-3">
                    <dt className="text-muted">Faltas</dt>
                    <dd className="text-lg font-bold text-ink">
                      {faltas} <span className="text-sm font-normal text-muted/70">de {maxFaltas}</span>
                    </dd>
                    <dd className="text-xs text-muted">
                      {restantes > 0 ? `Você ainda pode faltar ${restantes}x` : "Limite de faltas atingido"}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-surface-2 p-3">
                    <dt className="text-muted">Apostila</dt>
                    <dd className="text-lg font-bold text-ink">
                      {APOSTILA_STATUS_LABEL[matricula.apostilaStatus as ApostilaStatus]}
                    </dd>
                  </div>
                </dl>

                {liberado ? (
                  <p className="mt-3 rounded-xl bg-positive-tint px-3 py-2 text-sm font-medium text-positive">
                    🎉 Tudo certo! Você está apto a receber o certificado deste módulo.
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <footer className="mt-8 text-center text-xs text-muted/70">
        Este link é pessoal. Em caso de dúvida, fale com a coordenação.
      </footer>
    </div>
  );
}
