import Link from "next/link";
import { dadosDashboard } from "@/lib/queries";
import { linkWhatsApp } from "@/lib/format";
import { Card, EmptyState } from "@/components/ui";

function StatCard({ valor, rotulo, href, children }: { valor: number; rotulo: string; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(33,30,24,0.04)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_rgba(31,75,57,0.10)]"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">{children}</span>
      <span>
        <span className="block font-display text-3xl leading-none text-ink">{valor}</span>
        <span className="mt-1 block text-sm text-muted">{rotulo}</span>
      </span>
    </Link>
  );
}

export default async function DashboardPage() {
  const { turmasAtivas, totalMembros, emRiscoFalta, apostilaPendente } = await dadosDashboard();

  return (
    <div className="animate-rise">
      <header className="mb-7 border-b border-line pb-5">
        <p className="text-sm font-medium text-accent">Painel</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink sm:text-[1.9rem]">Visão geral</h1>
        <p className="mt-1 text-sm text-muted">O que precisa da sua atenção hoje.</p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <StatCard valor={turmasAtivas} rotulo="Turmas ativas" href="/turmas">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM22 20v-2a4 4 0 0 0-3-3.87" />
          </svg>
        </StatCard>
        <StatCard valor={totalMembros} rotulo="Membros cadastrados" href="/membros">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M22 10 12 5 2 10l10 5 10-5ZM6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
          </svg>
        </StatCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-ink">
            Em risco por falta
            {emRiscoFalta.length > 0 ? (
              <span className="rounded-full bg-danger-tint px-2 py-0.5 text-xs font-semibold text-danger">{emRiscoFalta.length}</span>
            ) : null}
          </h2>
          {emRiscoFalta.length === 0 ? (
            <EmptyState titulo="Ninguém no limite" descricao="Todos dentro do limite de faltas do módulo." />
          ) : (
            <div className="space-y-2">
              {emRiscoFalta.map((item, indice) => (
                <Card key={`${item.turmaId}-${indice}`}>
                  <Link href={`/turmas/${item.turmaId}`} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{item.membroNome}</p>
                      <p className="truncate text-sm text-muted">{item.turmaNome}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-danger-tint px-2.5 py-1 text-xs font-semibold text-danger">
                      {item.faltas} / {item.maxFaltas} faltas
                    </span>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-ink">
            Apostila pendente
            {apostilaPendente.length > 0 ? (
              <span className="rounded-full bg-warn-tint px-2 py-0.5 text-xs font-semibold text-warn">{apostilaPendente.length}</span>
            ) : null}
          </h2>
          {apostilaPendente.length === 0 ? (
            <EmptyState titulo="Tudo em dia" descricao="Nenhuma apostila pendente." />
          ) : (
            <div className="space-y-2">
              {apostilaPendente.map((item, indice) => {
                const wpp = linkWhatsApp(
                  item.telefone,
                  `Olá, ${item.membroNome}! Passando para lembrar do pagamento da apostila da turma ${item.turmaNome}. 🙏`,
                );
                return (
                  <Card key={`${item.turmaId}-pend-${indice}`}>
                    <div className="flex items-center justify-between gap-3">
                      <Link href={`/turmas/${item.turmaId}`} className="min-w-0">
                        <p className="truncate font-medium text-ink">{item.membroNome}</p>
                        <p className="truncate text-sm text-muted">{item.turmaNome}</p>
                      </Link>
                      {wpp ? (
                        <a
                          href={wpp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Cobrar
                        </a>
                      ) : null}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
