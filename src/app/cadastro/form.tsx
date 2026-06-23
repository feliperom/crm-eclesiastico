"use client";

import { useActionState } from "react";
import { cadastrarMembroPublico, EstadoCadastroMembro } from "./actions";
import { Button, Field, Input, Select } from "@/components/ui";
import { EnderecoFields } from "@/components/endereco-fields";
import { ETAPAS_TRILHO_ORDEM, ETAPA_TRILHO_LABEL } from "@/lib/constants";

export function CadastroMembroForm({ 
  celulas, 
  redes 
}: { 
  celulas: { id: string; nome: string }[];
  redes: { id: string; nome: string }[];
}) {
  const [estado, formAction, pendente] = useActionState<EstadoCadastroMembro, FormData>(cadastrarMembroPublico, {});

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-ink border-b border-line pb-2">Dados Pessoais</h2>
        
        <Field label="Nome Completo">
          <Input name="nome" placeholder="Seu nome completo" required />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="E-mail">
            <Input name="email" type="email" placeholder="seu@email.com" required />
          </Field>
          <Field label="Telefone / WhatsApp">
            <Input name="telefone" placeholder="(00) 00000-0000" required />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Data de Nascimento">
            <Input name="dataNascimento" type="date" />
          </Field>
          <Field label="Data de Batismo">
            <Input name="dataBatismo" type="date" />
          </Field>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-ink border-b border-line pb-2">Endereço</h2>
        <EnderecoFields />
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-ink border-b border-line pb-2">Igreja</h2>
        <Field label="Qual célula você participa?">
          <Select name="celulaId">
            <option value="">Ainda não participo de nenhuma célula</option>
            {celulas.map(celula => (
              <option key={celula.id} value={celula.id}>{celula.nome}</option>
            ))}
          </Select>
        </Field>

        <Field label="Em qual etapa do Trilho você está?">
          <Select name="etapaTrilho">
            <option value="">Ainda não iniciei o trilho</option>
            {ETAPAS_TRILHO_ORDEM.map(etapa => (
              <option key={etapa} value={etapa}>{ETAPA_TRILHO_LABEL[etapa]}</option>
            ))}
          </Select>
        </Field>

        <div className="space-y-2">
          <span className="block text-sm font-semibold text-ink">Quais Redes você participa?</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {redes.map(rede => (
              <label key={rede.id} className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input type="checkbox" name="redesIds" value={rede.id} className="rounded border-line text-primary focus:ring-primary" />
                {rede.nome}
              </label>
            ))}
            {redes.length === 0 && (
              <span className="text-sm text-muted">Nenhuma rede cadastrada.</span>
            )}
          </div>
        </div>
      </div>

      {estado.erro && (
        <div className="rounded-xl bg-danger-tint p-4 text-sm font-medium text-danger animate-in fade-in">
          {estado.erro}
        </div>
      )}

      <Button type="submit" className="w-full py-3 text-lg" disabled={pendente}>
        {pendente ? "Enviando cadastro..." : "Finalizar Cadastro"}
      </Button>
    </form>
  );
}
