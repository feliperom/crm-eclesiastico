import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calcularSituacao, certificadoElegivel } from "@/lib/situacao";
import { formatarData } from "@/lib/format";
import { PrintButton } from "@/components/print-button";

export const dynamic = "force-dynamic";

function Aviso({ titulo, descricao, turmaId }: { titulo: string; descricao: string; turmaId: string }) {
  return (
    <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-warn-tint text-warn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      </div>
      <h1 className="mt-4 font-display text-2xl text-ink">{titulo}</h1>
      <p className="mt-2 text-sm text-muted">{descricao}</p>
      <Link href={`/turmas/${turmaId}`} className="mt-6 text-sm font-semibold text-primary">
        ← Voltar para a turma
      </Link>
    </div>
  );
}

export default async function CertificadoPage({ params }: { params: Promise<{ matriculaId: string }> }) {
  const { matriculaId } = await params;

  const matricula = await prisma.matricula.findUnique({
    where: { id: matriculaId },
    include: {
      membro: true,
      certificado: true,
      turma: { include: { modulo: { include: { nivel: true } } } },
      _count: { select: { presencas: { where: { presente: false } } } },
    },
  });
  if (!matricula) notFound();

  const situacao = calcularSituacao({
    faltas: matricula._count.presencas,
    maxFaltas: matricula.turma.modulo.maxFaltas,
    status: matricula.status,
    encerrada: matricula.turma.encerradaEm !== null,
  });

  if (!matricula.certificado) {
    if (!certificadoElegivel(situacao, matricula.apostilaStatus)) {
      return (
        <Aviso
          titulo="Certificado ainda não liberado"
          descricao={`Para emitir, a turma precisa estar encerrada, ${matricula.membro.nome.split(" ")[0]} aprovado(a) e a apostila quitada.`}
          turmaId={matricula.turmaId}
        />
      );
    }
    return (
      <Aviso
        titulo="Certificado não emitido"
        descricao="Volte à turma e clique em “Emitir certificado” para registrar e gerar a folha."
        turmaId={matricula.turmaId}
      />
    );
  }

  const { nivel } = matricula.turma.modulo;
  const certificado = matricula.certificado;

  return (
    <div className="relative z-10 min-h-dvh bg-canvas px-4 py-6">
      <div className="no-print mx-auto mb-6 flex max-w-4xl items-center justify-between">
        <Link href={`/turmas/${matricula.turmaId}`} className="text-sm font-semibold text-muted hover:text-ink">
          ← Voltar
        </Link>
        <PrintButton />
      </div>

      {/* Folha do certificado — A4 paisagem */}
      <div className="folha-certificado mx-auto aspect-[1.414/1] w-full max-w-4xl overflow-hidden rounded-[var(--radius-card)] bg-surface p-3 shadow-[0_10px_40px_rgba(28,23,38,0.12)] print:max-w-none print:rounded-none">
        <div className="flex h-full flex-col items-center justify-center border-2 border-primary/30 px-10 text-center">
          <div className="w-full border-b border-accent/40 pb-5">
            <span className="inline-grid h-12 w-12 place-items-center rounded-xl bg-primary-tint text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 3 3 7.5 12 12l9-4.5L12 3ZM7 10v5c0 1.4 2.2 2.8 5 2.8s5-1.4 5-2.8v-5" />
              </svg>
            </span>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">Escola Ministerial</p>
          </div>

          <p className="mt-8 text-sm uppercase tracking-[0.35em] text-accent">Certificado de Conclusão</p>
          <p className="mt-6 text-sm text-muted">Certificamos que</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink sm:text-5xl">{matricula.membro.nome}</h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink">
            concluiu com aproveitamento o <strong>{matricula.turma.modulo.nome}</strong> do{" "}
            <strong>{nivel.nome}</strong>, cumprindo a frequência mínima exigida e os requisitos do curso.
          </p>

          <div className="mt-12 flex w-full items-end justify-between gap-8 px-6">
            <div className="flex-1 text-center">
              <div className="mx-auto w-56 border-t border-ink/40" />
              <p className="mt-2 text-xs uppercase tracking-widest text-muted">Coordenação</p>
            </div>
            <div className="text-xs text-muted">{formatarData(certificado.emitidoEm)}</div>
            <div className="flex-1 text-center">
              <div className="mx-auto w-56 border-t border-ink/40" />
              <p className="mt-2 text-xs uppercase tracking-widest text-muted">Direção</p>
            </div>
          </div>

          <p className="mt-6 text-[11px] text-muted/70">
            Certificado nº {certificado.numero} · emitido por {certificado.emitidoPor}
          </p>
        </div>
      </div>
    </div>
  );
}
