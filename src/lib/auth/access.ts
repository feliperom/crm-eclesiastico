import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CARGO, type Cargo } from "@/lib/constants";
import { auth } from "./server";

// E-mails em EMAILS_COORDENACAO são sempre Coordenador (bootstrap — nunca trava
// o acesso). Os demais membros e seus cargos vêm da tabela `membros`.
function emailsBootstrap(): string[] {
  return (process.env.EMAILS_COORDENACAO ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

// Check por e-mail (sem sessão) — usado no login, onde a sessão ainda não está
// disponível na mesma ação.
export async function emailTemAcesso(email: string): Promise<boolean> {
  const normalizado = email.trim().toLowerCase();
  if (!normalizado) return false;
  if (emailsBootstrap().includes(normalizado)) return true;
  const membro = await prisma.membro.findUnique({ where: { email: normalizado } });
  return membro !== null;
}

export type Membro = { id: string | null; nome: string; email: string; cargo: Cargo };

// Retorna o membro logado (com cargo) ou null se não tiver acesso ao painel.
export async function obterMembro(): Promise<Membro | null> {
  const { data: session } = await auth.getSession();
  const usuario = session?.user;
  if (!usuario?.email) return null;

  const email = usuario.email.toLowerCase();
  const nome = usuario.name || usuario.email;

  if (emailsBootstrap().includes(email)) {
    return { id: null, nome, email, cargo: CARGO.ADMIN };
  }

  const membro = await prisma.membro.findUnique({ where: { email } });
  if (!membro) return null;
  return { id: membro.id, nome: membro.nome || nome, email, cargo: membro.cargo as Cargo };
}

export async function souAdmin(): Promise<boolean> {
  const membro = await obterMembro();
  return membro?.cargo === CARGO.ADMIN;
}

// Guarda para Server Actions de escrita: bloqueia quem não é Coordenador
// (Diretor é somente leitura) mandando para uma página de aviso.
export async function garantirAdmin(): Promise<void> {
  if (!(await souAdmin())) redirect("/sem-permissao");
}

export async function garantirLideranca(): Promise<Membro> {
  const membro = await obterMembro();
  if (!membro) redirect("/sem-permissao");
  if (membro.cargo === CARGO.ADMIN || membro.cargo === CARGO.LIDER_CELULA) {
    return membro;
  }
  redirect("/sem-permissao");
}

export async function verificarDonoCelula(celulaId: string): Promise<boolean> {
  const membro = await obterMembro();
  if (!membro) return false;
  if (membro.cargo === CARGO.ADMIN) return true;

  const celula = await prisma.celula.findUnique({ where: { id: celulaId } });
  return celula?.liderId === membro.id;
}

export async function verificarPertenceCelula(membroAlvoId: string): Promise<boolean> {
  const membro = await obterMembro();
  if (!membro) return false;
  if (membro.cargo === CARGO.ADMIN) return true;

  const membroAlvo = await prisma.membro.findUnique({ where: { id: membroAlvoId } });
  if (!membroAlvo?.celulaId) return false;

  const celula = await prisma.celula.findUnique({ where: { id: membroAlvo.celulaId } });
  return celula?.liderId === membro.id;
}
