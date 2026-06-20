import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calcularSituacao } from "@/lib/situacao";
import { obterBaseUrl } from "@/lib/base-url";
import { linkWhatsApp, formatarData } from "@/lib/format";
import { APOSTILA_STATUS_LABEL, ETAPAS_TRILHO_ORDEM, ETAPA_TRILHO_LABEL, type ApostilaStatus } from "@/lib/constants";
import { Badge, Card, EmptyState, Field, Input, PageHeader, SituacaoBadge } from "@/components/ui";
import { EnderecoFields } from "@/components/endereco-fields";
import { CopiarLink } from "@/components/copiar-link";
import { ConfirmButton } from "@/components/confirm-button";
import { atualizarMembro, excluirMembro, registrarEtapaTrilho, removerEtapaTrilho } from "../actions";
import { garantirLideranca, verificarPertenceCelula } from "@/lib/auth/access";
import { CARGO } from "@/lib/constants";

export default async function MembroDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const membro = await prisma.membro.findUnique({
    where: { id },
    include: {
      historicoTrilho: true,
      matriculas: {
        include: {
          turma: { include: { modulo: { include: { nivel: true } } } },
          notas: { include: { prova: true } },
          _count: { select: { presencas: { where: { presente: false } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!membro) notFound();

  const membroLogado = await garantirLideranca();
  const isAdmin = membroLogado.cargo === CARGO.ADMIN;

  if (!isAdmin) {
    const pertence = await verificarPertenceCelula(membro.id);
    if (!pertence) notFound();
  }

  const baseUrl = await obterBaseUrl();
  const linkPortal = `${baseUrl}/membro/${membro.token}`;
  const wpp = linkWhatsApp(
    membro.telefone,
    `Olá, ${membro.nome}! Aqui você acompanha sua frequência e situação na Escola Ministerial: ${linkPortal}`,
  );

  return (
    <div>
      <Link href="/membros" className="mb-2 inline-block text-sm text-muted">
        ← Membros
      </Link>
      <PageHeader titulo={membro.nome} descricao={membro.telefone ?? undefined} />

      {/* Dados Pessoais */}
      <Card className="mb-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">Dados Pessoais</h2>
        <div className="grid grid-cols-2 gap-4 text-sm text-ink">
          <div>
            <p className="text-xs text-muted">Data de Nascimento</p>
            <p>{membro.dataNascimento ? formatarData(membro.dataNascimento) : "Não informada"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Data de Batismo</p>
            <p>{membro.dataBatismo ? formatarData(membro.dataBatismo) : "Não informada"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted">Endereço</p>
            <p>
              {membro.endereco ? `${membro.endereco}${membro.numero ? `, ${membro.numero}` : ""}` : "Não informado"}
              {membro.complemento ? ` - ${membro.complemento}` : ""}
            </p>
            {(membro.cep || membro.bairro || membro.cidade) && (
              <p className="mt-1">
                {membro.bairro ? `${membro.bairro}` : ""}
                {membro.bairro && membro.cidade ? " - " : ""}
                {membro.cidade ? `${membro.cidade}` : ""}
                {membro.cep ? ` (${membro.cep})` : ""}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Link público (link mágico, sem senha) */}
      <Card className="mb-5">
        <h2 className="mb-2 text-sm font-semibold text-ink">Página do membro</h2>
        <p className="mb-2 text-xs text-muted">Compartilhe este link — o membro acompanha tudo sem precisar de senha.</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={linkPortal}
            className="min-w-0 flex-1 rounded-lg border border-line bg-surface-2 px-2 py-2 text-xs text-muted"
          />
          <CopiarLink url={linkPortal} />
        </div>
        {wpp ? (
          <a
            href={wpp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Enviar pelo WhatsApp
          </a>
        ) : null}
      </Card>

      {/* Jornada (Trilho) */}
      <h2 className="mt-8 mb-4 text-sm font-semibold text-ink">Jornada (Trilho)</h2>
      <div className="relative mb-10 ml-3 space-y-6 before:absolute before:inset-y-3 before:left-0 before:-translate-x-px before:w-0.5 before:bg-line/60">
        {ETAPAS_TRILHO_ORDEM.map((etapa) => {
          const historico = membro.historicoTrilho.find((h) => h.etapa === etapa);
          const concluido = !!historico;
          return (
            <div key={etapa} className="relative pl-8">
              {/* Dot da Timeline */}
              <span
                className={`absolute left-0 top-1/2 grid h-6 w-6 -translate-x-[11.5px] -translate-y-1/2 place-items-center rounded-full ring-4 ring-canvas transition-all duration-300 ${
                  concluido ? "bg-primary text-white" : "bg-surface-2 ring-1 ring-line text-transparent"
                }`}
              >
                {concluido && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>

              {/* Card de Conteúdo */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border bg-surface p-4 shadow-sm transition-all hover:shadow-md ${concluido ? "border-primary/20" : "border-line"}`}>
                <div>
                  <h3 className={`font-medium ${concluido ? "text-ink" : "text-muted"}`}>{ETAPA_TRILHO_LABEL[etapa]}</h3>
                  <p className="mt-0.5 text-xs text-muted">
                    {concluido ? `Concluído em ${formatarData(historico.dataConclusao)}` : "Pendente"}
                  </p>
                </div>
                
                {concluido ? (
                  <form action={removerEtapaTrilho} className="mt-2 sm:mt-0">
                    <input type="hidden" name="membroId" value={membro.id} />
                    <input type="hidden" name="etapa" value={etapa} />
                    <button type="submit" className="text-[11px] font-semibold text-muted hover:text-danger hover:underline">
                      Desfazer
                    </button>
                  </form>
                ) : (
                  <form action={registrarEtapaTrilho} className="mt-2 sm:mt-0">
                    <input type="hidden" name="membroId" value={membro.id} />
                    <input type="hidden" name="etapa" value={etapa} />
                    <button type="submit" className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white">
                      Registrar conclusão
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Histórico Escolar */}
      <h2 className="mb-3 text-sm font-semibold text-ink">Histórico da Escola Ministerial</h2>
      {membro.matriculas.length === 0 ? (
        <EmptyState titulo="Sem matrículas" descricao="Matricule o membro em uma turma." />
      ) : (
        <div className="mb-5 space-y-2">
          {membro.matriculas.map((matricula) => {
            const faltas = matricula._count.presencas;
            const situacao = calcularSituacao({
              faltas,
              maxFaltas: matricula.turma.modulo.maxFaltas,
              status: matricula.status,
              encerrada: matricula.turma.encerradaEm !== null,
            });
            return (
              <Card key={matricula.id}>
                <Link href={`/turmas/${matricula.turmaId}`}>
                  <p className="font-medium text-ink">{matricula.turma.nome}</p>
                  <p className="text-sm text-muted">
                    {matricula.turma.modulo.nivel.nome} · {matricula.turma.modulo.nome}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <SituacaoBadge situacao={situacao} />
                    <Badge>{faltas} falta(s)</Badge>
                    <Badge>Apostila: {APOSTILA_STATUS_LABEL[matricula.apostilaStatus as ApostilaStatus]}</Badge>
                  </div>
                </Link>
                {matricula.notas.length > 0 ? (
                  <div className="mt-3 border-t border-line pt-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Boletim</p>
                    <ul className="space-y-0.5">
                      {[...matricula.notas]
                        .sort((a, b) => a.prova.ordem - b.prova.ordem)
                        .map((nota) => (
                          <li key={nota.id} className="flex justify-between text-sm text-ink">
                            <span>{nota.prova.nome}</span>
                            <span className="font-medium">
                              {nota.valor} <span className="text-muted">/ {nota.prova.notaMaxima}</span>
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      {/* Editar dados */}
      {isAdmin && (
        <details className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <summary className="cursor-pointer text-sm font-semibold text-primary">Editar dados</summary>
          <form action={atualizarMembro} className="mt-4 space-y-3">
            <input type="hidden" name="id" value={membro.id} />
            <Field label="Nome">
              <Input name="nome" defaultValue={membro.nome} required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Telefone (WhatsApp)">
                <Input name="telefone" defaultValue={membro.telefone ?? ""} inputMode="tel" />
              </Field>
              <Field label="E-mail">
                <Input name="email" type="email" defaultValue={membro.email ?? ""} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data de Nascimento">
                <Input name="dataNascimento" type="date" defaultValue={membro.dataNascimento ? membro.dataNascimento.toISOString().split('T')[0] : ""} />
              </Field>
              <Field label="Data de Batismo">
                <Input name="dataBatismo" type="date" defaultValue={membro.dataBatismo ? membro.dataBatismo.toISOString().split('T')[0] : ""} />
              </Field>
            </div>
            <EnderecoFields
              defaultCep={membro.cep ?? ""}
              defaultBairro={membro.bairro ?? ""}
              defaultCidade={membro.cidade ?? ""}
              defaultEndereco={membro.endereco ?? ""}
              defaultNumero={membro.numero ?? ""}
              defaultComplemento={membro.complemento ?? ""}
            />
            <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
              Salvar
            </button>
          </form>
        </details>
      )}

      {/* Zona de Perigo */}
      {isAdmin && (
        <div className="mt-8 rounded-2xl border border-danger/30 bg-danger/5 p-4">
          <h2 className="mb-1 text-sm font-semibold text-danger">Zona de Perigo</h2>
          <p className="mb-4 text-xs text-danger/80">
            A exclusão é permanente e removerá todo o histórico de trilho e matrículas deste membro.
          </p>
          <form action={excluirMembro}>
            <input type="hidden" name="id" value={membro.id} />
            <ConfirmButton
              titulo={`Excluir ${membro.nome}?`}
              descricao="Esta ação não pode ser desfeita. Histórico e matrículas serão perdidos."
              triggerLabel="Excluir Membro"
              triggerClassName="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger-dark"
            >
              Sim, Excluir Definitivamente
            </ConfirmButton>
          </form>
        </div>
      )}
    </div>
  );
}
