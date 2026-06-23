import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CadastroMembroForm } from "./form";

export default async function CadastroPage() {
  const celulas = await prisma.celula.findMany({
    orderBy: { nome: "asc" },
  });
  
  const redes = await prisma.rede.findMany({
    orderBy: { nome: "asc" },
  });

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center py-12 px-6">
      <div className="w-full max-w-xl bg-surface p-8 rounded-3xl shadow-xl border border-line">
        <div className="mb-8 text-center">
          <span className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-primary-tint text-primary mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M19 8v6" />
              <path d="M22 11h-6" />
            </svg>
          </span>
          <h1 className="font-display text-3xl font-bold text-ink">Cadastro de Membro</h1>
          <p className="text-sm text-muted mt-2">Preencha seus dados para fazer parte da nossa igreja.</p>
        </div>

        <CadastroMembroForm celulas={celulas} redes={redes} />
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Já é cadastrado e quer acessar o painel?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Fazer Login
        </Link>
      </p>
    </div>
  );
}
