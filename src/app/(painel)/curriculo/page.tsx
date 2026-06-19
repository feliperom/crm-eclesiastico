import { prisma } from "@/lib/prisma";
import { Badge, Button, Card, EmptyState, Field, Input, PageHeader } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";
import {
  criarMateria,
  criarModulo,
  criarNivel,
  criarProva,
  excluirMateria,
  excluirModulo,
  excluirNivel,
  excluirProva,
} from "./actions";

export default async function CurriculoPage() {
  const niveis = await prisma.nivel.findMany({
    orderBy: { ordem: "asc" },
    include: {
      modulos: {
        orderBy: { ordem: "asc" },
        include: {
          materias: { orderBy: { ordem: "asc" } },
          provas: { orderBy: { ordem: "asc" }, include: { materias: true } },
          _count: { select: { turmas: true } },
        },
      },
    },
  });

  return (
    <div>
      <PageHeader titulo="Currículo" descricao="Níveis, módulos, aulas e provas — a base fixa das turmas" />

      <details className="mb-5 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold text-primary">+ Novo nível</summary>
        <form action={criarNivel} className="mt-4 flex gap-2">
          <Input name="nome" placeholder="Nível 1" required className="flex-1" />
          <Button type="submit">Criar</Button>
        </form>
      </details>

      {niveis.length === 0 ? (
        <EmptyState titulo="Nenhum nível ainda" descricao="Crie o primeiro nível acima." />
      ) : (
        <div className="space-y-5">
          {niveis.map((nivel) => (
            <section key={nivel.id}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-base font-bold text-ink">{nivel.nome}</h2>
                <form action={excluirNivel}>
                  <input type="hidden" name="id" value={nivel.id} />
                  <ConfirmButton
                    titulo={`Excluir ${nivel.nome}?`}
                    descricao="Todos os módulos, aulas e provas deste nível serão apagados. Isso não pode ser desfeito."
                    triggerLabel="Excluir nível"
                    triggerClassName="text-xs font-medium text-muted/70 hover:text-danger"
                  >
                    excluir nível
                  </ConfirmButton>
                </form>
              </div>

              <div className="space-y-3">
                {nivel.modulos.map((modulo) => (
                  <Card key={modulo.id}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-ink">{modulo.nome}</p>
                        <Badge cor="bg-warn-tint text-warn">máx. {modulo.maxFaltas} faltas</Badge>
                      </div>
                      {modulo._count.turmas === 0 ? (
                        <form action={excluirModulo}>
                          <input type="hidden" name="id" value={modulo.id} />
                          <ConfirmButton
                            titulo={`Excluir ${modulo.nome}?`}
                            descricao="As aulas e provas deste módulo serão apagadas."
                            triggerLabel="Excluir módulo"
                            triggerClassName="text-sm text-muted/70 hover:text-danger"
                          >
                            ✕
                          </ConfirmButton>
                        </form>
                      ) : (
                        <span className="text-xs text-muted/70">{modulo._count.turmas} turma(s)</span>
                      )}
                    </div>

                    {/* Aulas */}
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Aulas</p>
                    <ul className="mb-3 space-y-1">
                      {modulo.materias.map((materia) => (
                        <li key={materia.id} className="flex items-center justify-between text-sm text-ink">
                          <span>• {materia.nome}</span>
                          <form action={excluirMateria}>
                            <input type="hidden" name="id" value={materia.id} />
                            <ConfirmButton
                              titulo={`Excluir ${materia.nome}?`}
                              descricao="A aula será removida do módulo."
                              triggerLabel="Excluir aula"
                              triggerClassName="text-sm text-muted/50 hover:text-danger"
                            >
                              ✕
                            </ConfirmButton>
                          </form>
                        </li>
                      ))}
                      {modulo.materias.length === 0 ? <li className="text-sm text-muted/70">Sem aulas ainda.</li> : null}
                    </ul>

                    <form action={criarMateria} className="mb-4 flex gap-2">
                      <input type="hidden" name="moduloId" value={modulo.id} />
                      <Input name="nome" placeholder="Nova aula" required className="flex-1" />
                      <Button type="submit" variante="secundario">
                        +
                      </Button>
                    </form>

                    {/* Provas */}
                    <p className="mb-1 border-t border-line pt-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Provas
                    </p>
                    <ul className="mb-2 space-y-1">
                      {modulo.provas.map((prova) => (
                        <li key={prova.id} className="flex items-center justify-between text-sm text-ink">
                          <span>
                            • {prova.nome}{" "}
                            <span className="text-xs text-muted">
                              (nota {prova.notaMaxima} · {prova.materias.length} aula{prova.materias.length === 1 ? "" : "s"})
                            </span>
                          </span>
                          <form action={excluirProva}>
                            <input type="hidden" name="id" value={prova.id} />
                            <ConfirmButton
                              titulo={`Excluir ${prova.nome}?`}
                              descricao="A prova e as notas lançadas serão apagadas."
                              triggerLabel="Excluir prova"
                              triggerClassName="text-sm text-muted/50 hover:text-danger"
                            >
                              ✕
                            </ConfirmButton>
                          </form>
                        </li>
                      ))}
                      {modulo.provas.length === 0 ? <li className="text-sm text-muted/70">Nenhuma prova.</li> : null}
                    </ul>

                    {modulo.materias.length > 0 ? (
                      <details className="rounded-xl border border-dashed border-line p-3">
                        <summary className="cursor-pointer text-sm font-medium text-primary">+ Nova prova</summary>
                        <form action={criarProva} className="mt-3 space-y-3">
                          <input type="hidden" name="moduloId" value={modulo.id} />
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Nome da prova">
                              <Input name="nome" placeholder="Prova 1" required />
                            </Field>
                            <Field label="Nota máxima">
                              <Input name="notaMaxima" type="number" step="0.5" defaultValue={10} min={1} required />
                            </Field>
                          </div>
                          <div>
                            <p className="mb-1.5 text-sm font-medium text-ink">Aulas que caem na prova</p>
                            <div className="space-y-1.5">
                              {modulo.materias.map((materia) => (
                                <label key={materia.id} className="flex items-center gap-2 text-sm text-ink">
                                  <input type="checkbox" name="materiaIds" value={materia.id} className="h-4 w-4 accent-primary" />
                                  {materia.nome}
                                </label>
                              ))}
                            </div>
                          </div>
                          <Button type="submit">Criar prova</Button>
                        </form>
                      </details>
                    ) : (
                      <p className="text-xs text-muted/70">Cadastre aulas antes de criar provas.</p>
                    )}
                  </Card>
                ))}
              </div>

              <details className="mt-3 rounded-xl border border-dashed border-line p-3">
                <summary className="cursor-pointer text-sm font-medium text-primary">+ Novo módulo em {nivel.nome}</summary>
                <form action={criarModulo} className="mt-3 space-y-3">
                  <input type="hidden" name="nivelId" value={nivel.id} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nome do módulo">
                      <Input name="nome" placeholder="Módulo 1" required />
                    </Field>
                    <Field label="Máx. de faltas">
                      <Input name="maxFaltas" type="number" defaultValue={3} min={0} required />
                    </Field>
                  </div>
                  <Button type="submit">Criar módulo</Button>
                </form>
              </details>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
