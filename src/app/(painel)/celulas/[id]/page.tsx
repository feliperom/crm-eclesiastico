import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge, Button, Card, EmptyState, PageHeader, Select, Field, Input } from "@/components/ui";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { ConfirmButton } from "@/components/confirm-button";
import { adicionarMembroCelula, adicionarLiderCelula, removerLiderCelula, editarDadosCelula, removerMembroCelula } from "../actions";
import { CARGO } from "@/lib/constants";
import { garantirLideranca } from "@/lib/auth/access";

const CLASSE_SELECT_LINHA =
  "rounded-lg border border-line bg-surface px-2 py-1 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

export default async function CelulaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const celula = await prisma.celula.findUnique({
    where: { id },
    include: {
      lideres: true,
      membros: { orderBy: { nome: "asc" } },
    },
  });

  if (!celula) notFound();

  const membroLogado = await garantirLideranca();
  const isAdmin = membroLogado.cargo === CARGO.ADMIN;

  // Se for LIDER_CELULA, só pode ver a sua própria célula
  if (!isAdmin && !celula.lideres?.some(l => l.id === membroLogado.id)) {
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
      NOT: {
        celulasLideradas: {
          some: { id }
        }
      }
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

      {/* Liderança da Célula */}
      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Liderança ({celula.lideres?.length || 0})</h2>
        </div>

        {isAdmin && (
          <form action={adicionarLiderCelula} className="mb-3 flex gap-2">
            <input type="hidden" name="id" value={celula.id} />
            <Select name="liderId" defaultValue="" required className="flex-1" disabled={possiveisLideres.length === 0}>
              <option value="" disabled>
                {possiveisLideres.length === 0 ? "Não há líderes disponíveis" : "Adicionar líder…"}
              </option>
              {possiveisLideres.map((membro) => (
                <option key={membro.id} value={membro.id}>
                  {membro.nome || membro.email}
                </option>
              ))}
            </Select>
            <Button type="submit" variante="secundario" disabled={possiveisLideres.length === 0}>
              Adicionar
            </Button>
          </form>
        )}

        {(!celula.lideres || celula.lideres.length === 0) ? (
          <EmptyState titulo="Nenhum líder definido" descricao="Selecione líderes para esta célula." />
        ) : (
          <div className="space-y-2">
            {celula.lideres.map((lider) => (
              <Card key={lider.id} className="border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/membros/${lider.id}`} className="font-medium text-ink hover:underline">
                      {lider.nome || lider.email}
                    </Link>
                  </div>
                  {isAdmin && (
                    <form action={removerLiderCelula}>
                      <input type="hidden" name="id" value={celula.id} />
                      <input type="hidden" name="liderId" value={lider.id} />
                      <ConfirmButton
                        titulo="Remover líder?"
                        descricao={`${lider.nome || lider.email} deixará de ser líder desta célula.`}
                        confirmarLabel="Remover"
                        triggerLabel="Remover"
                        triggerClassName="text-sm text-muted/70 hover:text-danger"
                      >
                        ✕
                      </ConfirmButton>
                    </form>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
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

      {/* Editar dados */}
      <details className="mt-8 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold text-primary">Editar dados gerais da célula</summary>
        <form action={editarDadosCelula} className="mt-4 space-y-3">
          <input type="hidden" name="id" value={celula.id} />
          <Field label="Nome da Célula">
            <Input name="nome" defaultValue={celula.nome} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Dia do encontro">
              <Input name="dia" defaultValue={celula.dia ?? ""} placeholder="Ex: Terça-feira" />
            </Field>
            <Field label="Horário">
              <Input name="horario" defaultValue={celula.horario ?? ""} placeholder="Ex: 20:00" />
            </Field>
          </div>
          <Field label="Bairro">
            <Input name="bairro" defaultValue={celula.bairro ?? ""} placeholder="Ex: Centro" />
          </Field>
          <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
            Salvar
          </button>
        </form>
      </details>
    </div>
  );
}
