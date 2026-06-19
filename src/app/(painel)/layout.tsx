import { AppShell } from "@/components/app-shell";
import { obterMembro } from "@/lib/auth/access";
import { CARGO } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const membro = await obterMembro();

  if (!membro) {
    // Autenticado, mas e-mail fora da allowlist (o middleware já barra os não logados).
    return (
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-danger-tint text-danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M18 8h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1M8 8V6a4 4 0 1 1 8 0v2" />
          </svg>
        </div>
        <h1 className="mt-4 font-display text-2xl text-ink">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted">Este e-mail não tem permissão para acessar o painel da coordenação.</p>
        <form action="/sair" method="post" className="mt-6">
          <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
            Sair
          </button>
        </form>
      </div>
    );
  }

  return (
    <AppShell nomeUsuario={membro.nome} cargo={membro.cargo}>
      {children}
    </AppShell>
  );
}
