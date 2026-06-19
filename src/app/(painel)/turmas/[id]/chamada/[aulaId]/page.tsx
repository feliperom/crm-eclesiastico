import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatarData } from "@/lib/format";
import { Button, EmptyState, PageHeader } from "@/components/ui";
import { ListaPresenca } from "@/components/lista-presenca";
import { salvarPresencas } from "../actions";

export default async function MarcarChamadaPage({ params }: { params: Promise<{ id: string; aulaId: string }> }) {
  const { id, aulaId } = await params;

  const aula = await prisma.aula.findUnique({
    where: { id: aulaId },
    include: { atribuicao: { include: { materia: true } } },
  });
  if (!aula || aula.atribuicao.turmaId !== id) notFound();

  const matriculas = await prisma.matricula.findMany({
    where: { turmaId: id },
    include: { membro: true, presencas: { where: { aulaId } } },
    orderBy: { membro: { nome: "asc" } },
  });

  const itens = matriculas.map((matricula) => ({
    matriculaId: matricula.id,
    membroNome: matricula.membro.nome,
    // Sem registro ainda → assume presente (padrão otimista da chamada).
    presente: matricula.presencas[0]?.presente ?? true,
  }));

  return (
    <div>
      <Link href={`/turmas/${id}/chamada`} className="mb-2 inline-block text-sm text-muted">
        ← Chamada
      </Link>
      <PageHeader
        titulo={aula.atribuicao.materia.nome}
        descricao={`${formatarData(aula.data)}${aula.tema ? ` · ${aula.tema}` : ""}`}
      />

      {itens.length === 0 ? (
        <EmptyState titulo="Nenhum membro matriculado" descricao="Matricule membros na turma antes da chamada." />
      ) : (
        <form action={salvarPresencas}>
          <input type="hidden" name="aulaId" value={aulaId} />
          <input type="hidden" name="turmaId" value={id} />
          <ListaPresenca itens={itens} />
          <div className="sticky bottom-20 mt-4">
            <Button type="submit" className="w-full py-3">
              Salvar chamada
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
