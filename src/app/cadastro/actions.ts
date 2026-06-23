"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ETAPAS_TRILHO_ORDEM, EtapaTrilho } from "@/lib/constants";

export type EstadoCadastroMembro = { erro?: string };

const membroSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome"),
  email: z.string().trim().min(1, "Informe o e-mail").email("E-mail inválido"),
  telefone: z.string().trim().min(1, "Informe o telefone"),
  celulaId: z.string().optional(),
  endereco: z.string().trim().optional(),
  numero: z.string().trim().optional(),
  complemento: z.string().trim().optional(),
  cep: z.string().trim().optional(),
  bairro: z.string().trim().optional(),
  cidade: z.string().trim().optional(),
  dataNascimento: z.string().optional(),
  dataBatismo: z.string().optional(),
  etapaTrilho: z.string().optional(),
});

export async function cadastrarMembroPublico(_estado: EstadoCadastroMembro, formData: FormData): Promise<EstadoCadastroMembro> {
  const parseResult = membroSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    celulaId: formData.get("celulaId") || undefined,
    endereco: formData.get("endereco") || undefined,
    numero: formData.get("numero") || undefined,
    complemento: formData.get("complemento") || undefined,
    cep: formData.get("cep") || undefined,
    bairro: formData.get("bairro") || undefined,
    cidade: formData.get("cidade") || undefined,
    dataNascimento: formData.get("dataNascimento") || undefined,
    dataBatismo: formData.get("dataBatismo") || undefined,
    etapaTrilho: formData.get("etapaTrilho") || undefined,
  });

  const redesIds = formData.getAll("redesIds").map(id => String(id));

  if (!parseResult.success) {
    return { erro: "Por favor, preencha todos os campos obrigatórios corretamente." };
  }

  const dados = parseResult.data;

  const emailExistente = await prisma.membro.findUnique({ where: { email: dados.email.toLowerCase() } });
  if (emailExistente) {
    return { erro: "Já existe um cadastro com este e-mail." };
  }

  let historicoTrilhoData = [];
  if (dados.etapaTrilho && ETAPAS_TRILHO_ORDEM.includes(dados.etapaTrilho as EtapaTrilho)) {
    const stageIndex = ETAPAS_TRILHO_ORDEM.indexOf(dados.etapaTrilho as EtapaTrilho);
    for (let i = 0; i <= stageIndex; i++) {
      historicoTrilhoData.push({
        etapa: ETAPAS_TRILHO_ORDEM[i],
        dataConclusao: new Date(),
      });
    }
  }

  await prisma.membro.create({
    data: {
      nome: dados.nome,
      email: dados.email.toLowerCase(),
      telefone: dados.telefone,
      celulaId: dados.celulaId || null,
      endereco: dados.endereco || null,
      numero: dados.numero || null,
      complemento: dados.complemento || null,
      cep: dados.cep || null,
      bairro: dados.bairro || null,
      cidade: dados.cidade || null,
      dataNascimento: dados.dataNascimento ? new Date(dados.dataNascimento) : null,
      dataBatismo: dados.dataBatismo ? new Date(dados.dataBatismo) : null,
      redes: redesIds.length > 0 ? { connect: redesIds.map(id => ({ id })) } : undefined,
      historicoTrilho: historicoTrilhoData.length > 0 ? { create: historicoTrilhoData } : undefined,
    }
  });

  redirect("/cadastro/sucesso");
}
