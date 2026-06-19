import { prisma } from "@/lib/prisma";
import { listarTurmas } from "@/lib/queries";
import { Badge, Button, CardLink, EmptyState, Field, Input, PageHeader, Select } from "@/components/ui";
import { criarTurma } from "./actions";

export default async function TurmasPage() {
  const [turmas, modulos] = await Promise.all([
    listarTurmas(),
    prisma.modulo.findMany({ include: { nivel: true }, orderBy: [{ nivel: { ordem: "asc" } }, { ordem: "asc" }] }),
  ]);

  return (
    <div>
      <PageHeader titulo="Turmas" descricao="Cada turma é a oferta de um módulo num período" />

      <details className="mb-5 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold text-primary">+ Nova turma</summary>
        <form action={criarTurma} className="mt-4 space-y-3">
          <Field label="Nome da turma">
            <Input name="nome" placeholder="Nível 1 — 2026.1" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ano">
              <Input name="ano" type="number" defaultValue={new Date().getFullYear()} required />
            </Field>
            <Field label="Período">
              <Input name="periodo" placeholder="Domingos 9h" />
            </Field>
          </div>
          <Field label="Módulo">
            <Select name="moduloId" required defaultValue="">
              <option value="" disabled>
                Selecione…
              </option>
              {modulos.map((modulo) => (
                <option key={modulo.id} value={modulo.id}>
                  {modulo.nivel.nome} - {modulo.nome}
                </option>
              ))}
            </Select>
          </Field>
          <Button type="submit">Criar turma</Button>
          {modulos.length === 0 ? (
            <p className="text-sm text-warn">Cadastre um módulo no Currículo antes de criar turmas.</p>
          ) : null}
        </form>
      </details>

      {turmas.length === 0 ? (
        <EmptyState titulo="Nenhuma turma ainda" descricao="Crie a primeira turma acima." />
      ) : (
        <div className="space-y-2">
          {turmas.map((turma) => (
            <CardLink key={turma.id} href={`/turmas/${turma.id}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{turma.nome}</p>
                  <p className="truncate text-sm text-muted">
                    {turma.modulo.nivel.nome} · {turma.modulo.nome}
                    {turma.periodo ? ` · ${turma.periodo}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {turma.ativa ? (
                    <Badge cor="bg-positive-tint text-positive">Ativa</Badge>
                  ) : (
                    <Badge cor="bg-surface-2 text-muted">Encerrada</Badge>
                  )}
                  <span className="text-xs text-muted">{turma._count.matriculas} membros</span>
                </div>
              </div>
            </CardLink>
          ))}
        </div>
      )}
    </div>
  );
}
