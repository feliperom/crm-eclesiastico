"use client";

export function PrintButton({ label = "Imprimir / Salvar PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(22,56,42,0.25)] transition-colors hover:bg-primary-dark"
    >
      {label}
    </button>
  );
}
