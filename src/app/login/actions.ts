"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { emailTemAcesso } from "@/lib/auth/access";

export type EstadoLogin = { erro?: string };

export async function entrar(_estado: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) return { erro: "Informe e-mail e senha." };

  const { error } = await auth.signIn.email({ email, password: senha });
  if (error) {
    return { erro: error.message?.toLowerCase().includes("verif") ? "Confirme seu e-mail antes de entrar." : "E-mail ou senha incorretos." };
  }

  if (!(await emailTemAcesso(email))) {
    return { erro: "Este e-mail não tem acesso ao painel." };
  }

  redirect("/");
}
