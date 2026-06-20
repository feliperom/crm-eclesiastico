import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

const protegerNavegacao = auth.middleware({ loginUrl: "/login" });

function temCookieDeSessao(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => cookie.name.includes("neon-auth.session_token"));
}

export default async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  
  // CSP Rigorosa
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${
      process.env.NODE_ENV === "production" ? "" : "'unsafe-eval'"
    };
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    connect-src 'self' https://viacep.com.br;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `;
  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, " ").trim();

  // Clonamos os headers para enviar ao Next.js (necessário para ele embutir o nonce nas tags <script>)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);

  let response: NextResponse | Response;

  const pathname = request.nextUrl.pathname;
  const rotasPublicas = ["/login", "/registrar", "/sair"];
  const isPublica = rotasPublicas.some(r => pathname === r || pathname.startsWith(`${r}/`)) || pathname.startsWith("/membro");

  if (isPublica) {
    // Rotas públicas recebem passe livre em qualquer método HTTP (ex: POST no form de login)
    response = NextResponse.next({ request: { headers: requestHeaders } });
  } else if (request.method !== "GET") {
    // Ações de servidor (POST/PUT/DELETE) em rotas privadas exigem o cookie
    if (temCookieDeSessao(request)) {
      response = NextResponse.next({ request: { headers: requestHeaders } });
    } else {
      response = new NextResponse("Não autorizado", { status: 401 });
    }
  } else {
    // Navegação GET em rotas privadas: deixamos o Neon Auth validar e redirecionar se precisar
    const newReq = new NextRequest(request, { headers: requestHeaders });
    response = await protegerNavegacao(newReq);
  }

  // Define o CSP também na resposta final para o navegador
  response.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
  
  return response;
}

export const config = {
  // Apenas excluímos arquivos estáticos e imagens, aplicando o CSP em tudo que é renderizado
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
