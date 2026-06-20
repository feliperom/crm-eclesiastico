"use client";

import { useState } from "react";
import { Field, Input } from "@/components/ui";

type EnderecoProps = {
  defaultCep?: string;
  defaultBairro?: string;
  defaultCidade?: string;
  defaultEndereco?: string;
  defaultNumero?: string;
  defaultComplemento?: string;
};

export function EnderecoFields({
  defaultCep = "",
  defaultBairro = "",
  defaultCidade = "",
  defaultEndereco = "",
  defaultNumero = "",
  defaultComplemento = "",
}: EnderecoProps) {
  const [cep, setCep] = useState(defaultCep);
  const [bairro, setBairro] = useState(defaultBairro);
  const [cidade, setCidade] = useState(defaultCidade);
  const [endereco, setEndereco] = useState(defaultEndereco);

  const buscarCep = async (valor: string) => {
    const limpo = valor.replace(/\D/g, "");
    if (limpo.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        if (data.bairro) setBairro(data.bairro);
        if (data.localidade && data.uf) setCidade(`${data.localidade} - ${data.uf}`);
        if (data.logradouro) setEndereco(data.logradouro);
      }
    } catch (e) {
      // ignora erro silenciosamente
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="CEP">
          <Input
            name="cep"
            value={cep}
            onChange={(e) => {
              setCep(e.target.value);
              if (e.target.value.replace(/\D/g, "").length === 8) {
                buscarCep(e.target.value);
              }
            }}
            placeholder="00000-000"
          />
        </Field>
        <Field label="CEP / Bairro">
          <Input name="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Ex: Centro" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cidade / Estado">
          <Input name="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: São Paulo - SP" />
        </Field>
        <Field label="Rua (Logradouro)">
          <Input name="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Ex: Rua das Flores" />
        </Field>
      </div>
      <div className="flex gap-3">
        <Field label="Número" className="w-1/3">
          <Input name="numero" defaultValue={defaultNumero} placeholder="123" />
        </Field>
        <Field label="Complemento" className="flex-1">
          <Input name="complemento" defaultValue={defaultComplemento} placeholder="Apto 12" />
        </Field>
      </div>
    </>
  );
}
