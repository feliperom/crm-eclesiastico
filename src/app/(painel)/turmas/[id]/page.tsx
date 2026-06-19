import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { obterTurmaDetalhe } from "@/lib/queries";
import { certificadoElegivel, faltasRestantes } from "@/lib/situacao";
import { formatarData } from "@/lib/format";
import { APOSTILA_STATUS, APOSTILA_STATUS_LABEL } from "@/lib/constants";
import { Badge, Button, Card, EmptyState, Field, Input, PageHeader, Select, SituacaoBadge } from "@/components/ui";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { ConfirmButton } from "@/components/confirm-button";
import {
  definirApostila,
  definirProfessor,
  editarTurma,
  emitirCertificado,
  encerrarTurma,
  excluirTurma,
  matricularMembro,
  reabrirTurma,
  removerMatricula,
  sincronizarGrade,
} from "../actions";

const CLASSE_SELECT_LINHA =
  "rounded-lg border border-line bg-surface px-2 py-1 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

export default async function TurmaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detalhe = await obterTurmaDetalhe(id);
  if (!detalhe) notFound();

  const { turma, encerrada, alunos } = detalhe;
  const idsMatriculados = new Set(turma.matriculas.map((matricula) => matricula.membroId));
  const [professores, todosMembros] = await Promise.all([
    prisma.professor.findMany({ orderBy: { nome: "asc" } }),
    prisma.membro.findMany({ orderBy: { nome: "asc" } }),
  ]);
  const membrosDisponiveis = todosMembros.filter((membro) => !idsMatriculados.has(membro.id));

  return (
    <div>
      <Link href="/turmas" className="mb-2 inline-block text-sm text-muted">
        ← Turmas
      </Link>
      <PageHeader
        titulo={turma.nome}
        descricao={`${turma.modulo.nivel.nome} · ${turma.modulo.nome}${turma.periodo ? ` · ${turma.periodo}` : ""} · máx. ${turma.modulo.maxFaltas} faltas`}
      />

      {encerrada && turma.encerradaEm ? (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink">
          <span aria-hidden>🔒</span>
          Turma encerrada em {formatarData(turma.encerradaEm)} — registros congelados. Emita os certificados abaixo.
        </div>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-2">
        {!encerrada ? (
          <Link
            href={`/turmas/${turma.id}/chamada`}
            className="flex flex-1 basis-44 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white shadow-sm hover:bg-primary-dark"
          >
            ✋ Fazer chamada
          </Link>
        ) : null}
        <Link
          href={`/turmas/${turma.id}/notas`}
          className="flex flex-1 basis-44 items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-4 py-3 font-semibold text-ink hover:bg-surface-2"
        >
          📝 Notas
        </Link>
        <Link
          href={`/relatorio/${turma.id}`}
          className="flex flex-1 basis-44 items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-4 py-3 font-semibold text-ink hover:bg-surface-2"
        >
          🖨️ Folha de frequência
        </Link>
      </div>

      {/* Grade: matéria + professor */}
      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Grade do módulo</h2>
          {!encerrada ? (
            <form action={sincronizarGrade}>
              <input type="hidden" name="turmaId" value={turma.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-muted hover:bg-surface-2"
                title="Puxar aulas do módulo que ainda não estão na grade"
              >
                ↻ Sincronizar
              </button>
            </form>
          ) : null}
        </div>
        <Card className="divide-y divide-line p-0">
          {turma.atribuicoes.map((atribuicao) => (
            <div key={atribuicao.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{atribuicao.materia.nome}</p>
                <p className="text-xs text-muted/70">{atribuicao._count.aulas} encontro(s)</p>
              </div>
              {encerrada ? (
                <span className="shrink-0 text-sm text-muted">{atribuicao.professor?.nome ?? "Sem professor"}</span>
              ) : (
                <form action={definirProfessor} className="shrink-0">
                  <input type="hidden" name="atribuicaoId" value={atribuicao.id} />
                  <input type="hidden" name="turmaId" value={turma.id} />
                  <AutoSubmitSelect
                    name="professorId"
                    defaultValue={atribuicao.professorId ?? ""}
                    aria-label={`Professor de ${atribuicao.materia.nome}`}
                    className={CLASSE_SELECT_LINHA}
                  >
                    <option value="">Sem professor</option>
                    {professores.map((professor) => (
                      <option key={professor.id} value={professor.id}>
                        {professor.nome}
                      </option>
                    ))}
                  </AutoSubmitSelect>
                </form>
              )}
            </div>
          ))}
        </Card>
      </section>

      {/* Membros */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Membros ({alunos.length})</h2>
        </div>

        {!encerrada ? (
          <form action={matricularMembro} className="mb-3 flex gap-2">
            <input type="hidden" name="turmaId" value={turma.id} />
            <Select name="membroId" defaultValue="" required className="flex-1" disabled={membrosDisponiveis.length === 0}>
              <option value="" disabled>
                {membrosDisponiveis.length === 0 ? "Todos os membros já matriculados" : "Matricular membro…"}
              </option>
              {membrosDisponiveis.map((membro) => (
                <option key={membro.id} value={membro.id}>
                  {membro.nome}
                </option>
              ))}
            </Select>
            <Button type="submit" variante="secundario" disabled={membrosDisponiveis.length === 0}>
              Matricular
            </Button>
          </form>
        ) : null}

        {alunos.length === 0 ? (
          <EmptyState titulo="Nenhum membro matriculado" descricao="Matricule membros acima." />
        ) : (
          <div className="space-y-2">
            {alunos.map(({ matricula, faltas, situacao }) => {
              const restantes = faltasRestantes(faltas, turma.modulo.maxFaltas);
              const elegivel = certificadoElegivel(situacao, matricula.apostilaStatus);
              return (
                <Card key={matricula.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/membros/${matricula.membroId}`} className="font-medium text-ink hover:underline">
                        {matricula.membro.nome}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <SituacaoBadge situacao={situacao} />
                        <Badge cor={faltas > turma.modulo.maxFaltas ? "bg-danger-tint text-danger" : "bg-surface-2 text-muted"}>
                          {faltas} falta(s){restantes > 0 && !encerrada ? ` · restam ${restantes}` : ""}
                        </Badge>
                      </div>
                      {matricula.certificado ? (
                        <Link
                          href={`/certificado/${matricula.id}`}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-positive hover:underline"
                        >
                          🎓 Ver certificado (nº {matricula.certificado.numero})
                        </Link>
                      ) : elegivel ? (
                        <form action={emitirCertificado} className="mt-2">
                          <input type="hidden" name="matriculaId" value={matricula.id} />
                          <button type="submit" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                            🎓 Emitir certificado
                          </button>
                        </form>
                      ) : null}
                    </div>
                    {!encerrada ? (
                      <form action={removerMatricula}>
                        <input type="hidden" name="matriculaId" value={matricula.id} />
                        <input type="hidden" name="turmaId" value={turma.id} />
                        <ConfirmButton
                          titulo="Remover matrícula?"
                          descricao={`${matricula.membro.nome} será desvinculado desta turma, junto com as presenças registradas.`}
                          confirmarLabel="Remover"
                          triggerLabel="Remover matrícula"
                          triggerClassName="text-sm text-muted/70 hover:text-danger"
                        >
                          ✕
                        </ConfirmButton>
                      </form>
                    ) : null}
                  </div>
                  <form action={definirApostila} className="mt-3 flex items-center gap-2">
                    <input type="hidden" name="matriculaId" value={matricula.id} />
                    <input type="hidden" name="turmaId" value={turma.id} />
                    <span className="text-xs text-muted">Apostila:</span>
                    <AutoSubmitSelect
                      name="apostilaStatus"
                      defaultValue={matricula.apostilaStatus}
                      aria-label={`Apostila de ${matricula.membro.nome}`}
                      className={CLASSE_SELECT_LINHA}
                    >
                      {Object.values(APOSTILA_STATUS).map((status) => (
                        <option key={status} value={status}>
                          {APOSTILA_STATUS_LABEL[status]}
                        </option>
                      ))}
                    </AutoSubmitSelect>
                  </form>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Encerrar / reabrir */}
      <section className="mt-8">
        {encerrada ? (
          <form action={reabrirTurma}>
            <input type="hidden" name="turmaId" value={turma.id} />
            <Button type="submit" variante="secundario">
              Reabrir turma
            </Button>
          </form>
        ) : (
          <form action={encerrarTurma}>
            <input type="hidden" name="turmaId" value={turma.id} />
            <ConfirmButton
              titulo={`Encerrar a turma ${turma.nome}?`}
              descricao="Os registros de presença e matrícula serão congelados, e a aprovação/reprovação será finalizada. Você pode reabrir depois se precisar corrigir algo."
              confirmarLabel="Encerrar"
              triggerLabel="Encerrar turma"
              triggerClassName="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Encerrar turma
            </ConfirmButton>
          </form>
        )}
      </section>

      {/* Editar / excluir turma */}
      <details className="mt-6 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold text-primary">Editar dados da turma</summary>
        <form action={editarTurma} className="mt-4 space-y-3">
          <input type="hidden" name="turmaId" value={turma.id} />
          <input type="hidden" name="ativa" value={turma.ativa ? "on" : ""} />
          <Field label="Nome da turma">
            <Input name="nome" defaultValue={turma.nome} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ano">
              <Input name="ano" type="number" defaultValue={turma.ano} required />
            </Field>
            <Field label="Período">
              <Input name="periodo" defaultValue={turma.periodo ?? ""} placeholder="Domingos 9h" />
            </Field>
          </div>
          <Button type="submit">Salvar alterações</Button>
        </form>

        <div className="mt-4 border-t border-line pt-4">
          <form action={excluirTurma}>
            <input type="hidden" name="turmaId" value={turma.id} />
            <ConfirmButton
              titulo={`Excluir a turma ${turma.nome}?`}
              descricao="Matrículas, presenças e aulas desta turma serão apagadas. Isso não pode ser desfeito."
              triggerLabel="Excluir turma"
              triggerClassName="text-sm font-semibold text-danger hover:underline"
            >
              Excluir turma
            </ConfirmButton>
          </form>
        </div>
      </details>
    </div>
  );
}
