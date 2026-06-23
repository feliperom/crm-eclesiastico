import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Button, CardLink, EmptyState, Field, Input, PageHeader, Select } from "@/components/ui";
import { EnderecoFields } from "@/components/endereco-fields";
import { criarMembro } from "./actions";
import { ETAPA_TRILHO_LABEL, ETAPAS_TRILHO_ORDEM } from "@/lib/constants";

export default async function MembrosPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const busca = q?.trim() ?? "";

  const where: Prisma.MembroWhereInput = busca
    ? { OR: [{ nome: { contains: busca, mode: "insensitive" } }, { telefone: { contains: busca } }] }
    : {};

  const membros = await prisma.membro.findMany({
    where,
    orderBy: { nome: "asc" },
    include: { _count: { select: { matriculas: true } } },
  });

  const celulas = await prisma.celula.findMany({ orderBy: { nome: "asc" } });
  const redes = await prisma.rede.findMany({ orderBy: { nome: "asc" } });

  return (
    <div>
      <PageHeader titulo="Membros" descricao="Cadastro e histórico" />

      <details className="mb-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold text-primary">+ Novo membro</summary>
        <form action={criarMembro} className="mt-4 space-y-3">
          <Field label="Nome">
            <Input name="nome" placeholder="Nome completo" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Telefone (WhatsApp)">
              <Input name="telefone" placeholder="11999990000" inputMode="tel" />
            </Field>
            <Field label="E-mail">
              <Input name="email" type="email" placeholder="opcional" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data de Nascimento">
              <Input name="dataNascimento" type="date" />
            </Field>
            <Field label="Data de Batismo">
              <Input name="dataBatismo" type="date" />
            </Field>
          </div>
          <EnderecoFields />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Célula">
              <Select name="celulaId" defaultValue="">
                <option value="">Nenhuma</option>
                {celulas.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </Select>
            </Field>
            <Field label="Etapa do Trilho">
              <Select name="etapaTrilho" defaultValue="">
                <option value="">Selecione…</option>
                {ETAPAS_TRILHO_ORDEM.map((etapa) => (
                  <option key={etapa} value={etapa}>{ETAPA_TRILHO_LABEL[etapa]}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Redes (Segure Ctrl/Cmd para múltipla seleção)">
            <Select name="redesIds" multiple className="h-24">
              {redes.map((r) => (
                <option key={r.id} value={r.id}>{r.nome}</option>
              ))}
            </Select>
          </Field>
          <Button type="submit">Cadastrar</Button>
        </form>
      </details>

      <form className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            name="q"
            defaultValue={busca}
            placeholder="Buscar por nome ou telefone…"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <Button type="submit" variante="secundario">
          Buscar
        </Button>
      </form>

      {membros.length === 0 ? (
        busca ? (
          <EmptyState titulo="Nenhum membro encontrado" descricao={`Nada para “${busca}”.`} />
        ) : (
          <EmptyState titulo="Nenhum membro ainda" descricao="Cadastre o primeiro membro acima." />
        )
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
          {busca ? <p className="p-4 text-xs text-muted border-b border-line">{membros.length} resultado(s) para “{busca}”.</p> : null}
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-2 text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Telefone</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {membros.map((membro) => (
                <tr key={membro.id} className="hover:bg-primary/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink">
                    {membro.nome}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {membro.telefone || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link 
                      href={`/membros/${membro.id}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                    >
                      Ver detalhes &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
