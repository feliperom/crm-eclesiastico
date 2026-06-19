import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Button, Card, EmptyState, Field, Input, PageHeader } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";
import { criarCelula, excluirCelula } from "./actions";
import { garantirLideranca } from "@/lib/auth/access";
import { CARGO } from "@/lib/constants";

export default async function CelulasPage() {
  const membroLogado = await garantirLideranca();
  const isAdmin = membroLogado.cargo === CARGO.ADMIN;

  const celulas = await prisma.celula.findMany({
    where: isAdmin ? {} : { liderId: membroLogado.id || "" },
    include: {
      lider: true,
      _count: { select: { membros: true } },
    },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <PageHeader titulo="Células" descricao="Gestão de grupos e células da igreja" />

      {isAdmin && (
        <details className="mb-5 rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <summary className="cursor-pointer text-sm font-semibold text-primary">+ Nova Célula</summary>
          <form action={criarCelula} className="mt-4 space-y-3">
            <Field label="Nome da Célula">
              <Input name="nome" placeholder="Ex: Célula Betel" required />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Bairro (opcional)">
                <Input name="bairro" placeholder="Ex: Centro" />
              </Field>
              <Field label="Dia da semana (opcional)">
                <Input name="dia" placeholder="Ex: Terça-feira" />
              </Field>
              <Field label="Horário (opcional)">
                <Input name="horario" placeholder="Ex: 20:00" />
              </Field>
            </div>
            <Button type="submit">Criar Célula</Button>
          </form>
        </details>
      )}

      <h2 className="mb-2 text-sm font-semibold text-ink">Células Ativas</h2>
      {celulas.length === 0 ? (
        <EmptyState titulo="Nenhuma célula" descricao="Crie a primeira célula acima." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {celulas.map((celula) => (
            <Card key={celula.id}>
              <div className="flex h-full flex-col">
                <div className="mb-2 flex items-start justify-between">
                  <Link href={`/celulas/${celula.id}`} className="block">
                    <h3 className="font-semibold text-ink hover:text-primary hover:underline">
                      {celula.nome}
                    </h3>
                  </Link>
                  {isAdmin && (
                    <form action={excluirCelula}>
                      <input type="hidden" name="id" value={celula.id} />
                      <ConfirmButton
                        titulo="Excluir célula?"
                        descricao="Isso removerá a célula, mas não os membros."
                        triggerLabel="Excluir"
                        triggerClassName="text-sm text-muted/70 hover:text-danger"
                      >
                        ✕
                      </ConfirmButton>
                    </form>
                  )}
                </div>
                
                <div className="mb-4 space-y-1 text-sm text-muted">
                  {celula.lider ? (
                    <p>Líder: <span className="text-ink">{celula.lider.nome || celula.lider.email}</span></p>
                  ) : (
                    <p className="text-warning">Sem líder definido</p>
                  )}
                  {celula.bairro && <p>Bairro: {celula.bairro}</p>}
                  {(celula.dia || celula.horario) && (
                    <p>
                      Encontros: {celula.dia} {celula.horario ? `às ${celula.horario}` : ""}
                    </p>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
                  <Badge cor="bg-surface-2 text-muted">{celula._count.membros} membros</Badge>
                  <Link
                    href={`/celulas/${celula.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Ver Detalhes &rarr;
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
