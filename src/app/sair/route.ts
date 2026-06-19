import { NextResponse, type NextRequest } from "next/server";

// Logout via route handler (fora do middleware): expira os cookies do Neon Auth
// e redireciona para o login. Acionado por um POST de formulário.
export async function POST(request: NextRequest) {
  const resposta = NextResponse.redirect(new URL("/login", request.url), { status: 303 });

  for (const cookie of request.cookies.getAll()) {
    if (!cookie.name.includes("neon-auth")) continue;
    // Expira casando os atributos do cookie original (prefixo __Secure- exige Secure + Path).
    resposta.cookies.set(cookie.name, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
  }

  return resposta;
}
