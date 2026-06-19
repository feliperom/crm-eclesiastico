import { prisma } from "@/lib/prisma";
import { Button, Card, EmptyState, Field, Input, PageHeader } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";
import { criarProfessor, excluirProfessor } from "./actions";

export default async function ProfessoresPage() {
  const professores = await prisma.professor.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { atribuicoes: true } } },
  });

  return (
    <div>
      <PageHeader titulo="Professores" descricao="Quem leciona as matérias das turmas" />

      <details className="mb-5 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold text-primary">+ Novo professor</summary>
        <form action={criarProfessor} className="mt-4 space-y-3">
          <Field label="Nome">
            <Input name="nome" placeholder="Nome do professor" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Telefone">
              <Input name="telefone" placeholder="11999990000" inputMode="tel" />
            </Field>
            <Field label="E-mail">
              <Input name="email" type="email" placeholder="opcional" />
            </Field>
          </div>
          <Button type="submit">Cadastrar</Button>
        </form>
      </details>

      {professores.length === 0 ? (
        <EmptyState titulo="Nenhum professor ainda" descricao="Cadastre o primeiro professor acima." />
      ) : (
        <div className="space-y-2">
          {professores.map((professor) => (
            <Card key={professor.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{professor.nome}</p>
                  <p className="truncate text-sm text-muted">
                    {professor.telefone ?? "sem telefone"} · {professor._count.atribuicoes} matéria(s)
                  </p>
                </div>
                <form action={excluirProfessor}>
                  <input type="hidden" name="id" value={professor.id} />
                  <ConfirmButton
                    titulo="Excluir professor?"
                    descricao={`${professor.nome} será removido. As matérias que ele lecionava ficarão sem professor.`}
                    triggerLabel="Excluir professor"
                    triggerClassName="shrink-0 text-sm text-muted/70 hover:text-danger"
                  >
                    ✕
                  </ConfirmButton>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
