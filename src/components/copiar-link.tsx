"use client";

import { useState } from "react";

export function CopiarLink({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="shrink-0 rounded-lg border border-line px-3 py-2 text-xs font-medium text-muted hover:bg-surface-2"
    >
      {copiado ? "Copiado!" : "Copiar"}
    </button>
  );
}
