import { APOSTILA_STATUS, MATRICULA_STATUS, SITUACAO, type ApostilaStatus, type Situacao } from "./constants";

type SituacaoInput = {
  faltas: number;
  maxFaltas: number;
  status: string;
  encerrada: boolean;
};

// Situação do membro na turma. Durante o curso, o máximo que se diz é "Cursando"
// (ou "Reprovado" se já estourou as faltas — isso é definitivo). "Aprovado" só
// aparece depois que a turma é encerrada. A apostila NÃO entra aqui — é um
// indicador à parte que some quando paga.
export function calcularSituacao({ faltas, maxFaltas, status, encerrada }: SituacaoInput): Situacao {
  if (status === MATRICULA_STATUS.TRANCADO) return SITUACAO.TRANCADO;
  if (faltas > maxFaltas) return SITUACAO.REPROVADO_FALTA;
  if (encerrada) return SITUACAO.APROVADO;
  return SITUACAO.CURSANDO;
}

export function apostilaQuitada(apostilaStatus: string): boolean {
  return apostilaStatus === APOSTILA_STATUS.PAGO || apostilaStatus === APOSTILA_STATUS.ISENTO;
}

// Certificado só é elegível com turma encerrada, membro aprovado e apostila quitada.
export function certificadoElegivel(situacao: Situacao, apostilaStatus: string): boolean {
  return situacao === SITUACAO.APROVADO && apostilaQuitada(apostilaStatus);
}

export const SITUACAO_LABEL: Record<Situacao, string> = {
  CURSANDO: "Cursando",
  APROVADO: "Aprovado",
  REPROVADO_FALTA: "Reprovado (faltas)",
  TRANCADO: "Trancado",
};

export const SITUACAO_COR: Record<Situacao, string> = {
  CURSANDO: "bg-surface-2 text-muted ring-1 ring-line",
  APROVADO: "bg-positive-tint text-positive",
  REPROVADO_FALTA: "bg-danger-tint text-danger",
  TRANCADO: "bg-surface-2 text-muted ring-1 ring-line",
};

export function faltasRestantes(faltas: number, maxFaltas: number): number {
  return Math.max(0, maxFaltas - faltas);
}

export { APOSTILA_STATUS, type ApostilaStatus };
