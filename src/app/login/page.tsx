import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative z-10 grid min-h-dvh lg:grid-cols-2">
      {/* Painel da marca — desktop */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-12 lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent ring-1 ring-accent/25">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 3 3 7.5 12 12l9-4.5L12 3ZM7 10v5c0 1.4 2.2 2.8 5 2.8s5-1.4 5-2.8v-5" />
            </svg>
          </span>
          <span className="font-display text-xl text-white">Escola Ministerial</span>
        </div>

        <blockquote className="max-w-md">
          <p className="font-display text-3xl leading-snug text-white">
            “Aplica o teu coração ao ensino e os teus ouvidos às palavras do conhecimento.”
          </p>
          <footer className="mt-4 text-sm uppercase tracking-[0.2em] text-sidebar-muted">Provérbios 23.12</footer>
        </blockquote>

        <p className="text-sm text-sidebar-muted">Painel da coordenação · acesso restrito</p>

        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
      </aside>

      {/* Formulário */}
      <main className="flex items-center justify-center px-6 py-12">
        <div className="animate-rise w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-primary-tint text-primary">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 3 3 7.5 12 12l9-4.5L12 3ZM7 10v5c0 1.4 2.2 2.8 5 2.8s5-1.4 5-2.8v-5" />
              </svg>
            </span>
          </div>

          <h1 className="font-display text-3xl text-ink">Bem-vindo de volta</h1>
          <p className="mb-8 mt-1 text-sm text-muted">Entre para acessar o painel da coordenação.</p>

          <LoginForm />

          <p className="mt-6 text-center text-xs text-muted">Acesso protegido por Neon Auth.</p>
        </div>
      </main>
    </div>
  );
}
