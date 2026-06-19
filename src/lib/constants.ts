// Status modelados como string no banco (SQLite) e validados aqui na aplicação.

export const APOSTILA_STATUS = {
  PENDENTE: "PENDENTE",
  PAGO: "PAGO",
  ISENTO: "ISENTO",
} as const;

export type ApostilaStatus = (typeof APOSTILA_STATUS)[keyof typeof APOSTILA_STATUS];

export const APOSTILA_STATUS_LABEL: Record<ApostilaStatus, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  ISENTO: "Isento",
};

export const CARGO = {
  ADMIN: "ADMIN",
  LIDER_CELULA: "LIDER_CELULA",
  COMUM: "COMUM",
} as const;

export type Cargo = (typeof CARGO)[keyof typeof CARGO];

export const CARGO_LABEL: Record<Cargo, string> = {
  ADMIN: "Administrador",
  LIDER_CELULA: "Líder de Célula",
  COMUM: "Membro",
};

export const ETAPA_TRILHO = {
  NOVO_MEMBRO: "NOVO_MEMBRO",
  CONSOLIDACAO: "CONSOLIDACAO",
  PRE_ENCONTRO: "PRE_ENCONTRO",
  ENCONTRO: "ENCONTRO",
  POS_ENCONTRO: "POS_ENCONTRO",
  ESCOLA_NIVEL_1: "ESCOLA_NIVEL_1",
  ESCOLA_NIVEL_2: "ESCOLA_NIVEL_2",
} as const;

export type EtapaTrilho = (typeof ETAPA_TRILHO)[keyof typeof ETAPA_TRILHO];

export const ETAPA_TRILHO_LABEL: Record<EtapaTrilho, string> = {
  NOVO_MEMBRO: "Novo Membro",
  CONSOLIDACAO: "Consolidação",
  PRE_ENCONTRO: "Pré Encontro",
  ENCONTRO: "Encontro com Deus",
  POS_ENCONTRO: "Pós-encontro",
  ESCOLA_NIVEL_1: "Escola Ministerial - Nível 1",
  ESCOLA_NIVEL_2: "Escola Ministerial - Nível 2",
};

export const ETAPAS_TRILHO_ORDEM: EtapaTrilho[] = [
  ETAPA_TRILHO.NOVO_MEMBRO,
  ETAPA_TRILHO.CONSOLIDACAO,
  ETAPA_TRILHO.PRE_ENCONTRO,
  ETAPA_TRILHO.ENCONTRO,
  ETAPA_TRILHO.POS_ENCONTRO,
  ETAPA_TRILHO.ESCOLA_NIVEL_1,
  ETAPA_TRILHO.ESCOLA_NIVEL_2,
];

export const MATRICULA_STATUS = {
  CURSANDO: "CURSANDO",
  TRANCADO: "TRANCADO",
} as const;

export type MatriculaStatus = (typeof MATRICULA_STATUS)[keyof typeof MATRICULA_STATUS];

export const MATRICULA_STATUS_LABEL: Record<MatriculaStatus, string> = {
  CURSANDO: "Cursando",
  TRANCADO: "Trancado",
};

// Situação derivada. "Aprovado" só existe depois que a turma é encerrada;
// durante o curso o padrão é "Cursando". A apostila é um indicador separado.
export const SITUACAO = {
  CURSANDO: "CURSANDO",
  APROVADO: "APROVADO",
  REPROVADO_FALTA: "REPROVADO_FALTA",
  TRANCADO: "TRANCADO",
} as const;

export type Situacao = (typeof SITUACAO)[keyof typeof SITUACAO];
