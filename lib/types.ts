export interface Lead {
  id: string;
  nome: string;
  cargo: string;
  empresa: string;
  setor: string;
  tamanho: string;
  cidade: string;
  linkedin: string;
  email: string;
  telefone: string;
  infoExtra: string;
}

export type Canal = "LinkedIn" | "E-mail";
export type Metodologia = "CLÁSSICA" | "AIDA";
export type Tom = "Profissional" | "Direto" | "Consultivo" | "Provocador";
export type StatusGeracao = "idle" | "generating" | "done" | "error";

export interface Config {
  apiKey: string;
  canal: Canal;
  metodologia: Metodologia;
  tom: Tom;
  limiteCaracteres: number;
}

export interface LeadWithMessage extends Lead {
  message: string | null;
  status: StatusGeracao;
  error?: string;
}

export interface GenerateRequest {
  lead: Lead;
  config: Config;
  mensagemAnterior?: string;
}

export interface GenerateResponse {
  message: string;
}
