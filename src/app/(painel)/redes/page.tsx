import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Button, Card, EmptyState, Field, Input, PageHeader } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";
import { criarRede, excluirRede } from "./actions";

export default async function RedesPage() {
  const redes = await prisma.rede.findMany({
    include: {
      _count: { select: { membros: true } },
    },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <PageHeader titulo="Redes" descricao="Ministérios e grupos de afinidade (ex: Casais, Jovens)" />

      <details className="mb-5 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold text-primary">+ Nova Rede</summary>
        <form action={criarRede} className="mt-4 space-y-3">
          <Field label="Nome da Rede">
            <Input name="nome" placeholder="Ex: Rede de Jovens" required />
          </Field>
          <Button type="submit">Criar Rede</Button>
        </form>
      </details>

      <h2 className="mb-2 text-sm font-semibold text-ink">Redes Ativas</h2>
      {redes.length === 0 ? (
        <EmptyState titulo="Nenhuma rede" descricao="Crie a primeira rede acima." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {redes.map((rede) => (
            <Card key={rede.id}>
              <div className="flex h-full flex-col">
                <div className="mb-2 flex items-start justify-between">
                  <Link href={`/redes/${rede.id}`} className="block">
                    <h3 className="font-semibold text-ink hover:text-primary hover:underline">
                      {rede.nome}
                    </h3>
                  </Link>
                  <form action={excluirRede}>
                    <input type="hidden" name="id" value={rede.id} />
                    <ConfirmButton
                      titulo="Excluir rede?"
                      descricao="Isso removerá a rede, mas não os membros."
                      triggerLabel="Excluir"
                      triggerClassName="text-sm text-muted/70 hover:text-danger"
                    >
                      ✕
                    </ConfirmButton>
                  </form>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
                  <Badge cor="bg-surface-2 text-muted">{rede._count.membros} membros</Badge>
                  <Link
                    href={`/redes/${rede.id}`}
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
