import Link from "next/link";

export default function SemPermissaoPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-warn-tint text-warn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
          <path d="m4 4 16 16" />
        </svg>
      </div>
      <h1 className="mt-4 font-display text-2xl text-ink">Somente leitura</h1>
      <p className="mt-2 text-sm text-muted">
        Seu acesso é de direção (leitura). Edições são feitas pela coordenação.
      </p>
      <Link href="/" className="mt-6 text-sm font-semibold text-primary">
        ← Voltar ao início
      </Link>
    </div>
  );
}
