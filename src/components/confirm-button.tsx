"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  titulo: string;
  descricao?: string;
  confirmarLabel?: string;
  triggerLabel: string;
  triggerClassName?: string;
  children: ReactNode; // conteúdo visível do gatilho (texto/ícone)
};

// Botão que pede confirmação antes de submeter o formulário pai (ações de exclusão).
export function ConfirmButton({
  titulo,
  descricao,
  confirmarLabel = "Excluir",
  triggerLabel,
  triggerClassName = "",
  children,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const gatilhoRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  function confirmar() {
    setAberto(false);
    gatilhoRef.current?.form?.requestSubmit();
  }

  return (
    <>
      <button
        ref={gatilhoRef}
        type="button"
        onClick={() => setAberto(true)}
        aria-label={triggerLabel}
        className={triggerClassName}
      >
        {children}
      </button>

      {aberto ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={() => setAberto(false)} aria-hidden />
          <div className="animate-rise relative w-full max-w-sm rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-2xl">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-danger-tint text-danger">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" />
              </svg>
            </div>
            <h2 className="font-display text-lg text-ink">{titulo}</h2>
            {descricao ? <p className="mt-1 text-sm text-muted">{descricao}</p> : null}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmar}
                className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
              >
                {confirmarLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
