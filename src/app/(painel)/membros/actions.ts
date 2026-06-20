"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { garantirAdmin, garantirLideranca, verificarPertenceCelula } from "@/lib/auth/access";

const membroSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome"),
  telefone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  celulaId: z.string().optional(),
  etapaTrilho: z.string().optional(),
  endereco: z.string().trim().optional(),
  numero: z.string().trim().optional(),
  complemento: z.string().trim().optional(),
  cep: z.string().trim().optional(),
  bairro: z.string().trim().optional(),
  cidade: z.string().trim().optional(),
  dataNascimento: z.string().optional(),
  dataBatismo: z.string().optional(),
});

export async function criarMembro(formData: FormData) {
  await garantirAdmin();
  const dados = membroSchema.parse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    email: formData.get("email"),
    celulaId: formData.get("celulaId") || undefined,
    etapaTrilho: formData.get("etapaTrilho") || undefined,
    endereco: formData.get("endereco") || undefined,
    numero: formData.get("numero") || undefined,
    complemento: formData.get("complemento") || undefined,
    cep: formData.get("cep") || undefined,
    bairro: formData.get("bairro") || undefined,
    cidade: formData.get("cidade") || undefined,
    dataNascimento: formData.get("dataNascimento") || undefined,
    dataBatismo: formData.get("dataBatismo") || undefined,
  });

  const redesIds = formData.getAll("redesIds").map(String).filter(Boolean);

  await prisma.membro.create({
    data: { 
      nome: dados.nome, 
      telefone: dados.telefone || null, 
      email: dados.email || null,
      endereco: dados.endereco || null,
      numero: dados.numero || null,
      complemento: dados.complemento || null,
      cep: dados.cep || null,
      bairro: dados.bairro || null,
      cidade: dados.cidade || null,
      dataNascimento: dados.dataNascimento ? new Date(dados.dataNascimento) : null,
      dataBatismo: dados.dataBatismo ? new Date(dados.dataBatismo) : null,
      celulaId: dados.celulaId || null,
      redes: redesIds.length > 0 ? { connect: redesIds.map(id => ({ id })) } : undefined,
      historicoTrilho: dados.etapaTrilho ? {
        create: {
          etapa: dados.etapaTrilho,
          dataConclusao: new Date()
        }
      } : undefined
    },
  });

  revalidatePath("/membros");
}

export async function atualizarMembro(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const dados = membroSchema.parse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    email: formData.get("email"),
    endereco: formData.get("endereco") || undefined,
    numero: formData.get("numero") || undefined,
    complemento: formData.get("complemento") || undefined,
    cep: formData.get("cep") || undefined,
    bairro: formData.get("bairro") || undefined,
    cidade: formData.get("cidade") || undefined,
    dataNascimento: formData.get("dataNascimento") || undefined,
    dataBatismo: formData.get("dataBatismo") || undefined,
  });

  await prisma.membro.update({
    where: { id },
    data: { 
      nome: dados.nome, 
      telefone: dados.telefone || null, 
      email: dados.email || null,
      endereco: dados.endereco || null,
      numero: dados.numero || null,
      complemento: dados.complemento || null,
      cep: dados.cep || null,
      bairro: dados.bairro || null,
      cidade: dados.cidade || null,
      dataNascimento: dados.dataNascimento ? new Date(dados.dataNascimento) : null,
      dataBatismo: dados.dataBatismo ? new Date(dados.dataBatismo) : null,
    },
  });

  revalidatePath(`/membros/${id}`);
  revalidatePath("/membros");
}

export async function registrarEtapaTrilho(formData: FormData) {
  await garantirLideranca();
  const membroId = z.string().min(1).parse(formData.get("membroId"));
  const etapa = z.string().min(1).parse(formData.get("etapa"));

  const temPermissao = await verificarPertenceCelula(membroId);
  if (!temPermissao) throw new Error("Sem permissão para alterar este membro");
  
  await prisma.historicoTrilho.upsert({
    where: {
      membroId_etapa: { membroId, etapa }
    },
    update: {
      dataConclusao: new Date()
    },
    create: {
      membroId,
      etapa,
      dataConclusao: new Date()
    }
  });

  revalidatePath(`/membros/${membroId}`);
}

export async function removerEtapaTrilho(formData: FormData) {
  await garantirLideranca();
  const membroId = z.string().min(1).parse(formData.get("membroId"));
  const etapa = z.string().min(1).parse(formData.get("etapa"));

  const temPermissao = await verificarPertenceCelula(membroId);
  if (!temPermissao) throw new Error("Sem permissão para alterar este membro");

  await prisma.historicoTrilho.delete({
    where: {
      membroId_etapa: { membroId, etapa }
    }
  });

  revalidatePath(`/membros/${membroId}`);
}

export async function excluirMembro(formData: FormData) {
  await garantirAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  await prisma.membro.delete({ where: { id } });
  revalidatePath("/membros");
  redirect("/membros");
}
