import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { SITUACAO_COR, SITUACAO_LABEL } from "@/lib/situacao";
import type { Situacao } from "@/lib/constants";

export function PageHeader({ titulo, descricao, acao }: { titulo: string; descricao?: string; acao?: ReactNode }) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink sm:text-[1.7rem]">{titulo}</h1>
        {descricao ? <p className="mt-1 text-sm text-muted">{descricao}</p> : null}
      </div>
      {acao}
    </header>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(33,30,24,0.04)] ${className}`}>
      {children}
    </div>
  );
}

export function CardLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`block rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(33,30,24,0.04)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_rgba(31,75,57,0.10)] ${className}`}
    >
      {children}
    </Link>
  );
}

export function SituacaoBadge({ situacao }: { situacao: Situacao }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${SITUACAO_COR[situacao]}`}>
      {SITUACAO_LABEL[situacao]}
    </span>
  );
}

export function Badge({ children, cor = "bg-surface-2 text-muted ring-1 ring-line" }: { children: ReactNode; cor?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cor}`}>{children}</span>;
}

export function EmptyState({ titulo, descricao }: { titulo: string; descricao?: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-surface-2/60 p-10 text-center">
      <p className="font-display text-lg text-ink">{titulo}</p>
      {descricao ? <p className="mt-1 text-sm text-muted">{descricao}</p> : null}
    </div>
  );
}

type ButtonProps = ComponentProps<"button"> & { variante?: "primario" | "secundario" | "perigo" };

const VARIANTES_BOTAO = {
  primario: "bg-primary text-white hover:bg-primary-dark shadow-[0_1px_2px_rgba(22,56,42,0.25)]",
  secundario: "border border-line bg-surface text-ink hover:bg-surface-2",
  perigo: "bg-danger text-white hover:brightness-95",
} as const;

export function Button({ variante = "primario", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${VARIANTES_BOTAO[variante]} ${className}`}
      {...props}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

const CLASSE_INPUT =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15";

export function Input(props: ComponentProps<"input">) {
  return <input className={CLASSE_INPUT} {...props} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select className={CLASSE_INPUT} {...props} />;
}
