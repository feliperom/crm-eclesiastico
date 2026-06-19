"use client";

import type { ReactNode } from "react";

// Select que envia o formulário ao mudar — usado para salvar professor/apostila
// numa interação só, sem botão por linha.
export function AutoSubmitSelect({
  name,
  defaultValue,
  children,
  className = "",
  "aria-label": ariaLabel,
}: {
  name: string;
  defaultValue: string;
  children: ReactNode;
  className?: string;
  "aria-label": string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      aria-label={ariaLabel}
      onChange={(evento) => evento.currentTarget.form?.requestSubmit()}
      className={className}
    >
      {children}
    </select>
  );
}
