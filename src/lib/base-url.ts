import { headers } from "next/headers";

// URL base derivada da requisição — usada para montar o link público do membro.
export async function obterBaseUrl(): Promise<string> {
  const lista = await headers();
  const host = lista.get("x-forwarded-host") ?? lista.get("host") ?? "localhost:3000";
  const protocolo = lista.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocolo}://${host}`;
}
