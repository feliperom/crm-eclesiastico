import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatarData, formatarDataEntrada } from "@/lib/format";
import { Button, Card, EmptyState, Field, Input, PageHeader, Select } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";
import { criarAula, excluirAula } from "./actions";

export default async function ChamadaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const turma = await prisma.turma.findUnique({
    where: { id },
    include: {
      atribuicoes: {
        include: { materia: true, aulas: { orderBy: { data: "desc" } } },
        orderBy: { materia: { ordem: "asc" } },
      },
    },
  });
  if (!turma) notFound();

  const aulas = turma.atribuicoes
    .flatMap((atribuicao) => atribuicao.aulas.map((aula) => ({ aula, materia: atribuicao.materia.nome })))
    .sort((a, b) => b.aula.data.getTime() - a.aula.data.getTime());

  return (
    <div>
      <Link href={`/turmas/${turma.id}`} className="mb-2 inline-block text-sm text-muted">
        ← {turma.nome}
      </Link>
      <PageHeader titulo="Chamada" descricao="Abra uma aula existente ou registre uma nova" />

      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-ink">Nova aula</h2>
        <form action={criarAula} className="space-y-3">
          <input type="hidden" name="turmaId" value={turma.id} />
          <Field label="Aula">
            <Select name="atribuicaoId" defaultValue="" required>
              <option value="" disabled>
                Selecione…
              </option>
              {turma.atribuicoes.map((atribuicao) => (
                <option key={atribuicao.id} value={atribuicao.id}>
                  {atribuicao.materia.nome}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data">
              <Input name="data" type="date" defaultValue={formatarDataEntrada(new Date())} required />
            </Field>
            <Field label="Tema (opcional)">
              <Input name="tema" placeholder="Tema da aula" />
            </Field>
          </div>
          <Button type="submit">Iniciar chamada</Button>
        </form>
      </Card>

      <h2 className="mb-2 text-sm font-semibold text-ink">Aulas registradas</h2>
      {aulas.length === 0 ? (
        <EmptyState titulo="Nenhuma aula registrada" descricao="Crie a primeira aula acima." />
      ) : (
        <div className="space-y-2">
          {aulas.map(({ aula, materia }) => (
            <Card key={aula.id}>
              <div className="flex items-center justify-between gap-3">
                <Link href={`/turmas/${turma.id}/chamada/${aula.id}`} className="min-w-0">
                  <p className="truncate font-medium text-ink">{materia}</p>
                  <p className="text-sm text-muted">
                    {formatarData(aula.data)}
                    {aula.tema ? ` · ${aula.tema}` : ""}
                  </p>
                </Link>
                <form action={excluirAula}>
                  <input type="hidden" name="aulaId" value={aula.id} />
                  <input type="hidden" name="turmaId" value={turma.id} />
                  <ConfirmButton
                    titulo="Excluir aula?"
                    descricao={`A aula de ${materia} em ${formatarData(aula.data)} e todas as presenças dela serão apagadas.`}
                    triggerLabel="Excluir aula"
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
    </div>
  );
}
