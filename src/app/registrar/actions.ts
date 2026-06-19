"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export type EstadoCadastro = { erro?: string };

export async function cadastrar(_estado: EstadoCadastro, formData: FormData): Promise<EstadoCadastro> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!nome || !email || !senha) return { erro: "Preencha todos os campos." };
  if (senha.length < 8) return { erro: "A senha precisa ter ao menos 8 caracteres." };

  const { error } = await auth.signUp.email({ name: nome, email, password: senha });
  if (error) {
    return { erro: error.message?.toLowerCase().includes("exist") ? "Já existe uma conta com este e-mail." : "Não foi possível criar a conta." };
  }

  redirect("/");
}
