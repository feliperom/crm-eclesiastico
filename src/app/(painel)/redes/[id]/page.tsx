import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button, Card, EmptyState, PageHeader, Select } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";
import { adicionarMembroRede, removerMembroRede } from "../actions";

export default async function RedeDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rede = await prisma.rede.findUnique({
    where: { id },
    include: {
      membros: { orderBy: { nome: "asc" } },
    },
  });

  if (!rede) notFound();

  // Membros que NÃO estão nesta rede
  // Prisma relacional `some` query can be used to filter those out.
  // We can just fetch all and filter in memory since the list might not be huge,
  // but let's try a DB query.
  const membrosDisponiveis = await prisma.membro.findMany({
    where: {
      NOT: {
        redes: {
          some: { id }
        }
      }
    },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <Link href="/redes" className="mb-2 inline-block text-sm text-muted">
        ← Redes
      </Link>
      <PageHeader titulo={rede.nome} descricao="Gestão de membros da rede" />

      {/* Membros da Rede */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Participantes ({rede.membros.length})</h2>
        </div>

        <form action={adicionarMembroRede} className="mb-3 flex gap-2">
          <input type="hidden" name="id" value={rede.id} />
          <Select name="membroId" defaultValue="" required className="flex-1" disabled={membrosDisponiveis.length === 0}>
            <option value="" disabled>
              {membrosDisponiveis.length === 0 ? "Todos os membros já estão nesta rede" : "Vincular participante…"}
            </option>
            {membrosDisponiveis.map((membro) => (
              <option key={membro.id} value={membro.id}>
                {membro.nome || membro.email}
              </option>
            ))}
          </Select>
          <Button type="submit" variante="secundario" disabled={membrosDisponiveis.length === 0}>
            Vincular
          </Button>
        </form>

        {rede.membros.length === 0 ? (
          <EmptyState titulo="Nenhum participante" descricao="Vincule membros utilizando o formulário acima." />
        ) : (
          <div className="space-y-2">
            {rede.membros.map((membro) => (
              <Card key={membro.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/membros/${membro.id}`} className="font-medium text-ink hover:underline">
                      {membro.nome || membro.email}
                    </Link>
                  </div>
                  <form action={removerMembroRede}>
                    <input type="hidden" name="id" value={rede.id} />
                    <input type="hidden" name="membroId" value={membro.id} />
                    <ConfirmButton
                      titulo="Remover participante?"
                      descricao={`${membro.nome || membro.email} será removido desta rede.`}
                      confirmarLabel="Remover"
                      triggerLabel="Remover"
                      triggerClassName="text-sm text-muted/70 hover:text-danger"
                    >
                      ✕
                    </ConfirmButton>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
