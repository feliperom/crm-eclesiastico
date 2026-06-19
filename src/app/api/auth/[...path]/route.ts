import { auth } from "@/lib/auth/server";

// Encaminha as chamadas de autenticação do cliente para o servidor do Neon Auth.
export const { GET, POST } = auth.handler();
