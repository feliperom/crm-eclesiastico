"use client";

import Link from "next/link";
import { useActionState } from "react";
import { entrar, type EstadoLogin } from "@/app/login/actions";

const estadoInicial: EstadoLogin = {};

const classeInput =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15";

export function LoginForm() {
  const [estado, acao, enviando] = useActionState(entrar, estadoInicial);

  return (
    <form action={acao} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">E-mail</span>
        <input name="email" type="email" autoComplete="email" required placeholder="voce@igreja.org" className={classeInput} />
      </label>
      <label className="block">
        <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-ink">
          Senha
          <Link href="/registrar" className="text-xs font-normal text-primary hover:underline">
            Primeiro acesso?
          </Link>
        </span>
        <input name="senha" type="password" autoComplete="current-password" required placeholder="••••••••" className={classeInput} />
      </label>

      {estado.erro ? <p className="rounded-xl bg-danger-tint px-3 py-2 text-sm text-danger">{estado.erro}</p> : null}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(22,56,42,0.25)] transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
