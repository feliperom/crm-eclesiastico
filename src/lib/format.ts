import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatarData(data: Date): string {
  return format(data, "dd/MM/yyyy", { locale: ptBR });
}

export function formatarDataHora(data: Date): string {
  return format(data, "dd/MM/yyyy 'às' HH'h'mm", { locale: ptBR });
}

export function formatarDataEntrada(data: Date): string {
  // valor para <input type="date">
  return format(data, "yyyy-MM-dd");
}

// Link de WhatsApp com mensagem pré-preenchida. Telefone só com dígitos.
export function linkWhatsApp(telefone: string | null, mensagem: string): string | null {
  if (!telefone) return null;
  const digitos = telefone.replace(/\D/g, "");
  if (!digitos) return null;
  const numero = digitos.startsWith("55") ? digitos : `55${digitos}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
