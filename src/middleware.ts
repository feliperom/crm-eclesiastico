import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

// O middleware do Neon Auth valida/atualiza a sessão nas navegações GET e
// redireciona não autenticados para /login. Em requisições não-GET (Server
// Actions) ele interfere no corpo e quebra a ação — então, para essas, apenas
// exigimos a presença do cookie de sessão. A autorização efetiva (allowlist)
// continua garantida no layout do painel.
const protegerNavegacao = auth.middleware({ loginUrl: "/login" });

function temCookieDeSessao(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => cookie.name.includes("neon-auth.session_token"));
}

export default async function proxy(request: NextRequest) {
  if (request.method !== "GET") {
    if (temCookieDeSessao(request)) return NextResponse.next();
    return new NextResponse("Não autorizado", { status: 401 });
  }
  return protegerNavegacao(request);
}

export const config = {
  // Rotas públicas ficam de fora: login, cadastro, logout, portal do membro e a API de auth.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|login|registrar|sair|membro).*)"],
};
