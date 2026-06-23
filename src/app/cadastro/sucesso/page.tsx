import Link from "next/link";
import { Button } from "@/components/ui";

export default function CadastroSucessoPage() {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center py-12 px-6">
      <div className="w-full max-w-sm bg-surface p-8 rounded-3xl shadow-xl border border-line text-center animate-in zoom-in-95 duration-500">
        <span className="inline-grid h-16 w-16 place-items-center rounded-full bg-success-tint text-success mb-6 mx-auto">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
        <h1 className="font-display text-2xl font-bold text-ink mb-2">Cadastro Realizado!</h1>
        <p className="text-sm text-muted mb-8">
          Seu cadastro foi recebido com sucesso. Aguarde o contato da liderança para os próximos passos.
        </p>

        <Link href="/">
          <Button className="w-full">Voltar para o Início</Button>
        </Link>
      </div>
    </div>
  );
}
