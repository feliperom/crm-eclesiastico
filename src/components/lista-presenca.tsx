"use client";

import { useState } from "react";

type ItemPresenca = { matriculaId: string; membroNome: string; presente: boolean };

export function ListaPresenca({ itens }: { itens: ItemPresenca[] }) {
  const [presencas, setPresencas] = useState<Record<string, boolean>>(
    () => Object.fromEntries(itens.map((item) => [item.matriculaId, item.presente])),
  );

  function definirTodos(valor: boolean) {
    setPresencas(Object.fromEntries(itens.map((item) => [item.matriculaId, valor])));
  }

  const totalPresentes = Object.values(presencas).filter(Boolean).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted">
          {totalPresentes} de {itens.length} presentes
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => definirTodos(true)}
            className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-muted hover:bg-surface-2"
          >
            Todos presentes
          </button>
          <button
            type="button"
            onClick={() => definirTodos(false)}
            className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-muted hover:bg-surface-2"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {itens.map((item) => {
          const presente = presencas[item.matriculaId];
          return (
            <label
              key={item.matriculaId}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 shadow-sm transition-colors ${
                presente ? "border-emerald-300 bg-positive-tint" : "border-line bg-surface"
              }`}
            >
              <span className="font-medium text-ink">{item.membroNome}</span>
              <input
                type="checkbox"
                name={`presente_${item.matriculaId}`}
                checked={presente}
                onChange={(evento) =>
                  setPresencas((atual) => ({ ...atual, [item.matriculaId]: evento.target.checked }))
                }
                className="h-6 w-6 accent-emerald-600"
              />
              <span className="sr-only">{presente ? "Presente" : "Ausente"}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
