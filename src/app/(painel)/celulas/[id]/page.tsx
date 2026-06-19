import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge, Button, Card, EmptyState, PageHeader, Select } from "@/components/ui";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { ConfirmButton } from "@/components/confirm-button";
import { adicionarMembroCelula, definirLider, removerMembroCelula } from "../actions";
import { CARGO } from "@/lib/constants";
import { garantirLideranca } from "@/lib/auth/access";

const CLASSE_SELECT_LINHA =
  "rounded-lg border border-line bg-surface px-2 py-1 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

export default async function CelulaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const celula = await prisma.celula.findUnique({
    where: { id },
    include: {
      lider: true,
      membros: { orderBy: { nome: "asc" } },
    },
  });

  if (!celula) notFound();

  const membroLogado = await garantirLideranca();
  const isAdmin = membroLogado.cargo === CARGO.ADMIN;

  // Se for LIDER_CELULA, só pode ver a sua própria célula
  if (!isAdmin && celula.liderId !== membroLogado.id) {
    notFound();
  }

  // Todos os membros que NÃO estão nesta célula, para poderem ser adicionados
  const membrosDisponiveis = await prisma.membro.findMany({
    where: { celulaId: { not: id } },
    orderBy: { nome: "asc" },
  });

  // Apenas membros que são Líderes ou Admin podem ser líderes de célula,
  // ou talvez qualquer membro se quisermos dar flexibilidade, mas vamos listar todos.
  const possiveisLideres = await prisma.membro.findMany({
    where: {
      cargo: { in: [CARGO.ADMIN, CARGO.LIDER_CELULA] }
    },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <Link href="/celulas" className="mb-2 inline-block text-sm text-muted">
        ← Células
      </Link>
      <PageHeader
        titulo={celula.nome}
        descricao={`${celula.bairro ? celula.bairro + " · " : ""}${celula.dia || ""} ${celula.horario || ""}`}
      />

      {/* Liderança */}
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-ink">Liderança da Célula</h2>
        <Card className="flex items-center justify-between p-3">
          <div className="min-w-0">
            <p className="font-medium text-ink">Líder Atual</p>
            <p className="text-sm text-muted">{celula.lider ? celula.lider.nome : "Nenhum líder definido"}</p>
          </div>
          {isAdmin && (
            <form action={definirLider} className="shrink-0">
              <input type="hidden" name="id" value={celula.id} />
              <AutoSubmitSelect
                name="liderId"
                defaultValue={celula.liderId ?? ""}
                aria-label="Líder da célula"
                className={CLASSE_SELECT_LINHA}
              >
                <option value="">Sem líder</option>
                {possiveisLideres.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome || l.email}
                  </option>
                ))}
              </AutoSubmitSelect>
            </form>
          )}
        </Card>
      </section>

      {/* Membros da Célula */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Membros ({celula.membros.length})</h2>
        </div>

        <form action={adicionarMembroCelula} className="mb-3 flex gap-2">
          <input type="hidden" name="id" value={celula.id} />
          <Select name="membroId" defaultValue="" required className="flex-1" disabled={membrosDisponiveis.length === 0}>
            <option value="" disabled>
              {membrosDisponiveis.length === 0 ? "Não há membros disponíveis" : "Adicionar membro…"}
            </option>
            {membrosDisponiveis.map((membro) => (
              <option key={membro.id} value={membro.id}>
                {membro.nome || membro.email} {membro.celulaId ? "(Já em outra célula)" : ""}
              </option>
            ))}
          </Select>
          <Button type="submit" variante="secundario" disabled={membrosDisponiveis.length === 0}>
            Adicionar
          </Button>
        </form>

        {celula.membros.length === 0 ? (
          <EmptyState titulo="Nenhum membro nesta célula" descricao="Adicione membros utilizando o formulário acima." />
        ) : (
          <div className="space-y-2">
            {celula.membros.map((membro) => (
              <Card key={membro.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/membros/${membro.id}`} className="font-medium text-ink hover:underline">
                      {membro.nome || membro.email}
                    </Link>
                  </div>
                  <form action={removerMembroCelula}>
                    <input type="hidden" name="id" value={celula.id} />
                    <input type="hidden" name="membroId" value={membro.id} />
                    <ConfirmButton
                      titulo="Remover membro?"
                      descricao={`${membro.nome || membro.email} será removido desta célula.`}
                      confirmarLabel="Remover"
                      triggerLabel="Remover membro"
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
