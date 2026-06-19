"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { CARGO, CARGO_LABEL, type Cargo } from "@/lib/constants";

type Item = { href: string; label: string; icone: ReactNode };

const ICON = {
  inicio: (
    <path d="M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" />
  ),
  turmas: (
    <path d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM22 20v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
  ),
  membros: (
    <path d="M22 10 12 5 2 10l10 5 10-5ZM6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5M22 10v5" />
  ),
  professores: (
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  ),
  curriculo: (
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5ZM9 7h6M9 11h6" />
  ),
  celulas: (
    <g><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></g>
  ),
  redes: (
    <g><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></g>
  ),
  usuarios: (
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
  ),
} as const;

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const ITENS: Item[] = [
  { href: "/", label: "Início", icone: <Glyph>{ICON.inicio}</Glyph> },
  { href: "/turmas", label: "Turmas", icone: <Glyph>{ICON.turmas}</Glyph> },
  { href: "/membros", label: "Membros", icone: <Glyph>{ICON.membros}</Glyph> },
  { href: "/celulas", label: "Células", icone: <Glyph>{ICON.celulas}</Glyph> },
  { href: "/redes", label: "Redes", icone: <Glyph>{ICON.redes}</Glyph> },
  { href: "/professores", label: "Professores", icone: <Glyph>{ICON.professores}</Glyph> },
  { href: "/curriculo", label: "Currículo", icone: <Glyph>{ICON.curriculo}</Glyph> },
];

const ITEM_USUARIOS: Item = { href: "/usuarios", label: "Usuários", icone: <Glyph>{ICON.usuarios}</Glyph> };

function ativo(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Marca() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent ring-1 ring-accent/25">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3 3 7.5 12 12l9-4.5L12 3ZM7 10v5c0 1.4 2.2 2.8 5 2.8s5-1.4 5-2.8v-5" />
        </svg>
      </span>
      <span className="font-display text-lg leading-none text-white">
        Escola
        <span className="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-sidebar-muted">
          Ministerial
        </span>
      </span>
    </Link>
  );
}

function NavLista({ itens, pathname, onNavegar }: { itens: Item[]; pathname: string; onNavegar?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {itens.map((item) => {
        const selecionado = ativo(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavegar}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              selecionado
                ? "bg-sidebar-2 text-white"
                : "text-sidebar-ink hover:bg-sidebar-2/60 hover:text-white"
            }`}
          >
            <span
              className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent transition-opacity ${
                selecionado ? "opacity-100" : "opacity-0"
              }`}
            />
            <span className={selecionado ? "text-accent" : "text-sidebar-muted group-hover:text-sidebar-ink"}>
              {item.icone}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function RodapeUsuario({ nome, cargo }: { nome: string; cargo: Cargo }) {
  const iniciais = nome
    .split(" ")
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="mt-auto flex items-center gap-2 rounded-xl bg-sidebar-2/60 p-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/15 text-xs font-semibold text-accent">
        {iniciais}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-sidebar-ink">{nome}</span>
        <span className="block text-[11px] text-sidebar-muted">{CARGO_LABEL[cargo]}</span>
      </span>
      <form action="/sair" method="post">
        <button
          type="submit"
          aria-label="Sair"
          title="Sair"
          className="grid h-8 w-8 place-items-center rounded-lg text-sidebar-muted hover:bg-sidebar hover:text-white"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export function AppShell({ children, nomeUsuario, cargo }: { children: ReactNode; nomeUsuario: string; cargo: Cargo }) {
  const pathname = usePathname();
  const [drawerAberto, setDrawerAberto] = useState(false);
  const itens = cargo === CARGO.ADMIN 
    ? [...ITENS, ITEM_USUARIOS] 
    : ITENS.filter((i) => i.href === "/celulas");

  useEffect(() => {
    setDrawerAberto(false);
  }, [pathname]);

  return (
    <div className="relative z-10 min-h-dvh">
      {/* Sidebar fixa — desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-black/20 bg-sidebar px-4 py-6 lg:flex">
        <div className="px-2">
          <Marca />
        </div>
        <div className="mt-8 flex-1">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">Módulos</p>
          <NavLista itens={itens} pathname={pathname} />
        </div>
        <RodapeUsuario nome={nomeUsuario} cargo={cargo} />
      </aside>

      {/* Topbar — mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerAberto(true)}
          aria-label="Abrir menu"
          className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-ink"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <span className="font-display text-base text-ink">Escola Ministerial</span>
        <span className="h-10 w-10" />
      </header>

      {/* Drawer — mobile */}
      {drawerAberto ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setDrawerAberto(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar px-4 py-6 shadow-2xl">
            <div className="flex items-center justify-between px-2">
              <Marca />
              <button
                type="button"
                onClick={() => setDrawerAberto(false)}
                aria-label="Fechar"
                className="grid h-8 w-8 place-items-center rounded-lg text-sidebar-ink hover:bg-sidebar-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <div className="mt-8">
              <NavLista itens={itens} pathname={pathname} onNavegar={() => setDrawerAberto(false)} />
            </div>
            <RodapeUsuario nome={nomeUsuario} cargo={cargo} />
          </div>
        </div>
      ) : null}

      {/* Conteúdo */}
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
