import { prisma } from "@/lib/prisma";
import { obterMembro } from "@/lib/auth/access";
import { CARGO, CARGO_LABEL, type Cargo } from "@/lib/constants";
import { Badge, Button, Card, EmptyState, Field, Input, PageHeader, Select } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";
import { criarMembro, excluirMembro } from "./actions";

export default async function UsuariosPage() {
  const membro = await obterMembro();
  if (membro?.cargo !== CARGO.ADMIN) {
    return (
      <EmptyState titulo="Acesso restrito" descricao="Apenas a administração pode gerenciar usuários." />
    );
  }

  const bootstrap = (process.env.EMAILS_COORDENACAO ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  const membros = await prisma.membro.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader titulo="Usuários" descricao="Quem acessa o painel e com qual cargo" />

      <details className="mb-5 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold text-primary">+ Convidar usuário</summary>
        <form action={criarMembro} className="mt-4 space-y-3">
          <Field label="E-mail">
            <Input name="email" type="email" placeholder="pessoa@igreja.org" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome (opcional)">
              <Input name="nome" placeholder="Nome" />
            </Field>
            <Field label="Cargo">
              <Select name="cargo" defaultValue={CARGO.COMUM} required>
                <option value={CARGO.COMUM}>{CARGO_LABEL.COMUM}</option>
                <option value={CARGO.LIDER_CELULA}>{CARGO_LABEL.LIDER_CELULA}</option>
                <option value={CARGO.ADMIN}>{CARGO_LABEL.ADMIN}</option>
              </Select>
            </Field>
          </div>
          <Button type="submit">Convidar</Button>
          <p className="text-xs text-muted">
            A pessoa entra criando a conta em <strong>/registrar</strong> com este mesmo e-mail.
          </p>
        </form>
      </details>

      {bootstrap.length > 0 ? (
        <div className="mb-4">
          <h2 className="mb-2 text-sm font-semibold text-ink">Coordenação (fixa)</h2>
          <div className="space-y-2">
            {bootstrap.map((email) => (
              <Card key={email}>
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm text-ink">{email}</p>
                  <Badge cor="bg-primary-tint text-primary">{CARGO_LABEL.ADMIN}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      <h2 className="mb-2 text-sm font-semibold text-ink">Convidados</h2>
      {membros.length === 0 ? (
        <EmptyState titulo="Nenhum convidado" descricao="Convide alguém acima." />
      ) : (
        <div className="space-y-2">
          {membros.map((m) => (
            <Card key={m.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{m.nome || m.email}</p>
                  {m.nome ? <p className="truncate text-xs text-muted">{m.email}</p> : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge cor={m.cargo === CARGO.ADMIN ? "bg-primary-tint text-primary" : "bg-surface-2 text-muted"}>
                    {CARGO_LABEL[m.cargo as Cargo]}
                  </Badge>
                  <form action={excluirMembro}>
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmButton
                      titulo={`Remover ${m.nome || m.email}?`}
                      descricao="A pessoa perde o acesso ao painel."
                      triggerLabel="Remover usuário"
                      triggerClassName="text-sm text-muted/70 hover:text-danger"
                    >
                      ✕
                    </ConfirmButton>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
