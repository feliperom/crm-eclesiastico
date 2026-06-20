import Link from "next/link";
import { RegistrarForm } from "@/components/registrar-form";

export default function RegistrarPage() {
  return (
    <div className="relative z-10 flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="animate-rise w-full max-w-sm">
        <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-primary-tint text-primary">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3 3 7.5 12 12l9-4.5L12 3ZM7 10v5c0 1.4 2.2 2.8 5 2.8s5-1.4 5-2.8v-5" />
          </svg>
        </span>

        <h1 className="mt-6 font-display text-3xl text-ink">Criar conta</h1>
        <p className="mb-8 mt-1 text-sm text-muted">Primeiro acesso da coordenação à Gestão Eclesiástica.</p>

        <RegistrarForm />

        <p className="mt-6 text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
