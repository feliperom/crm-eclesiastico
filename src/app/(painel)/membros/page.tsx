import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Button, CardLink, EmptyState, Field, Input, PageHeader } from "@/components/ui";
import { criarMembro } from "./actions";

export default async function MembrosPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const busca = q?.trim() ?? "";

  const where: Prisma.MembroWhereInput = busca
    ? { OR: [{ nome: { contains: busca, mode: "insensitive" } }, { telefone: { contains: busca } }] }
    : {};

  const membros = await prisma.membro.findMany({
    where,
    orderBy: { nome: "asc" },
    include: { _count: { select: { matriculas: true } } },
  });

  return (
    <div>
      <PageHeader titulo="Membros" descricao="Cadastro e histórico" />

      <details className="mb-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold text-primary">+ Novo membro</summary>
        <form action={criarMembro} className="mt-4 space-y-3">
          <Field label="Nome">
            <Input name="nome" placeholder="Nome completo" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Telefone (WhatsApp)">
              <Input name="telefone" placeholder="11999990000" inputMode="tel" />
            </Field>
            <Field label="E-mail">
              <Input name="email" type="email" placeholder="opcional" />
            </Field>
          </div>
          <Button type="submit">Cadastrar</Button>
        </form>
      </details>

      <form className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            name="q"
            defaultValue={busca}
            placeholder="Buscar por nome ou telefone…"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <Button type="submit" variante="secundario">
          Buscar
        </Button>
      </form>

      {membros.length === 0 ? (
        busca ? (
          <EmptyState titulo="Nenhum membro encontrado" descricao={`Nada para “${busca}”.`} />
        ) : (
          <EmptyState titulo="Nenhum membro ainda" descricao="Cadastre o primeiro membro acima." />
        )
      ) : (
        <div className="space-y-2">
          {busca ? <p className="text-xs text-muted">{membros.length} resultado(s) para “{busca}”.</p> : null}
          {membros.map((membro) => (
            <CardLink key={membro.id} href={`/membros/${membro.id}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{membro.nome}</p>
                  {membro.telefone ? <p className="truncate text-sm text-muted">{membro.telefone}</p> : null}
                </div>
                <span className="shrink-0 text-xs text-muted">{membro._count.matriculas} turma(s)</span>
              </div>
            </CardLink>
          ))}
        </div>
      )}
    </div>
  );
}
