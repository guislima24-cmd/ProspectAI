import { Config, Lead } from "./types";

// ─── Templates (usados tanto para gerar quanto para pré-visualização) ────────

export const SYSTEM_PROMPT_TEMPLATE = `Você é um especialista em prospecção B2B para empresas juniores universitárias.
Sua função é escrever mensagens de prospecção personalizadas, diretas e humanas
para o time comercial da {{nome_ej}}.
{{secao_contexto}}
Regras obrigatórias:
- NUNCA mencione serviços específicos (Mapeamento de Processos, Pesquisa de Mercado, etc.)
- O único objetivo da mensagem é conseguir uma reunião diagnóstica
- NUNCA use frases genéricas como "Espero que esteja bem" ou "Me chamo X e trabalho em Y"
- SEMPRE comece com algo específico sobre a empresa ou o setor do lead
- A mensagem deve parecer escrita por um humano que pesquisou o lead
- Máximo de {{limite_caracteres}} caracteres
- Tom: {{tom}}
- Canal: {{canal}}
- Metodologia: {{metodologia}}
{{instrucoes_metodologia}}
Formato de resposta: apenas o texto da mensagem, sem aspas, sem explicações adicionais.`;

export const USER_PROMPT_TEMPLATE = `Escreva uma mensagem de prospecção para o seguinte lead:
- Nome: {{lead_nome}}
- Cargo: {{lead_cargo}}
- Empresa: {{lead_empresa}}
- Setor: {{lead_setor}}
- Tamanho empresa: {{lead_tamanho}} funcionários
- Localização: {{lead_cidade}}
- LinkedIn URL: {{lead_linkedin}}
{{lead_info_extra}}
Lembre-se: a mensagem deve parecer personalizada para essa pessoa especificamente, não um template genérico.`;

export const REGEN_PROMPT_TEMPLATE = `Reescreva a mensagem abaixo de forma diferente para o mesmo lead.
Use uma abordagem ou ângulo diferente da versão anterior.
Lead: {{lead_nome}} | {{lead_cargo}} | {{lead_empresa}} | {{lead_setor}}
Versão anterior (NÃO repita esta abordagem):
{{mensagem_anterior}}

Escreva apenas o novo texto da mensagem, sem aspas, sem explicações adicionais.`;

// ─── Variáveis "visíveis" — as que o usuário definiu diretamente ─────────────

/** Retorna só as variáveis que vieram do usuário (para highlight na preview). */
export function getUserVarNames(config: Config): Set<string> {
  const names = new Set(["nome_ej"]);
  if (config.variaveis.pitchEJ) names.add("secao_contexto");
  if (config.variaveis.cases) names.add("secao_contexto");
  config.variaveis.custom.forEach((v) => {
    if (v.chave) names.add(`custom_${v.chave}`);
  });
  return names;
}

// ─── Construção do mapa de variáveis ─────────────────────────────────────────

export function buildVarsMap(
  config: Config,
  lead: Lead
): Record<string, string> {
  const vars: Record<string, string> = {
    // Variáveis da EJ
    nome_ej: config.variaveis.nomeEJ || "sua empresa júnior",
    secao_contexto: buildSecaoContexto(config),
    // Config
    limite_caracteres: String(config.limiteCaracteres),
    tom: config.tom,
    canal: config.canal,
    metodologia: config.metodologia,
    instrucoes_metodologia: buildInstrucoesMetodologia(
      config.metodologia,
      config.variaveis.nomeEJ || "sua empresa júnior"
    ),
    // Lead
    lead_nome: lead.nome || "N/A",
    lead_cargo: lead.cargo || "N/A",
    lead_empresa: lead.empresa || "N/A",
    lead_setor: lead.setor || "N/A",
    lead_tamanho: lead.tamanho || "N/A",
    lead_cidade: lead.cidade || "N/A",
    lead_linkedin: lead.linkedin || "N/A",
    lead_info_extra: lead.infoExtra?.trim()
      ? `Contexto adicional: ${lead.infoExtra}\n`
      : "",
  };

  // Variáveis custom do usuário
  config.variaveis.custom.forEach((v) => {
    if (v.chave && v.valor) {
      vars[v.chave] = v.valor;
    }
  });

  return vars;
}

function buildSecaoContexto(config: Config): string {
  const linhas: string[] = [];
  const nome = config.variaveis.nomeEJ || "a empresa júnior";

  if (config.variaveis.pitchEJ.trim()) {
    linhas.push(`Sobre a ${nome}: ${config.variaveis.pitchEJ.trim()}`);
  }
  if (config.variaveis.cases.trim()) {
    linhas.push(
      `Exemplos de resultados que a ${nome} já entregou: ${config.variaveis.cases.trim()}`
    );
  }
  // variáveis custom extras
  const extras = config.variaveis.custom.filter((v) => v.chave && v.valor);
  if (extras.length > 0) {
    linhas.push(
      "Contexto adicional:\n" +
        extras.map((v) => `- ${v.chave}: ${v.valor}`).join("\n")
    );
  }

  return linhas.length > 0 ? linhas.join("\n") + "\n" : "";
}

function buildInstrucoesMetodologia(
  metodologia: Config["metodologia"],
  nomeEJ: string
): string {
  if (metodologia === "CLÁSSICA") {
    return `Estruture a mensagem assim (metodologia CLÁSSICA):
1. PROBLEMA: gere empatia mostrando que entende o contexto/dor do lead
2. SOLUÇÃO: apresente a ${nomeEJ} como caminho lógico
3. BENEFÍCIOS: foque em resultados tangíveis, não no que fazemos mas no que entregamos
4. DIFERENCIAL: responda implicitamente "por que ${nomeEJ} e não outro?"
5. CTA: convide para uma reunião diagnóstica de forma específica e com urgência`;
  }
  return `Estruture a mensagem assim (metodologia AIDA):
1. ATENÇÃO: capture com uma dor ou pergunta provocadora sobre o setor/empresa do lead
2. INTERESSE: gere curiosidade apresentando a ${nomeEJ} como solução
3. DESEJO: mostre valor e exclusividade para criar vontade de conversar
4. AÇÃO: CTA direto convidando para reunião diagnóstica`;
}

// ─── Interpolação ─────────────────────────────────────────────────────────────

/** Substitui todos os {{var}} no template pelos valores do mapa. */
export function interpolate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

// ─── Funções públicas de build ────────────────────────────────────────────────

export function buildSystemPrompt(config: Config): string {
  const lead = LEAD_PLACEHOLDER; // só para o mapa; lead não é usado no system prompt
  const vars = buildVarsMap(config, lead);
  return interpolate(SYSTEM_PROMPT_TEMPLATE, vars);
}

export function buildUserPrompt(lead: Lead): string {
  // config não importa para o user prompt (só lead)
  const vars: Record<string, string> = {
    lead_nome: lead.nome || "N/A",
    lead_cargo: lead.cargo || "N/A",
    lead_empresa: lead.empresa || "N/A",
    lead_setor: lead.setor || "N/A",
    lead_tamanho: lead.tamanho || "N/A",
    lead_cidade: lead.cidade || "N/A",
    lead_linkedin: lead.linkedin || "N/A",
    lead_info_extra: lead.infoExtra?.trim()
      ? `Contexto adicional: ${lead.infoExtra}\n`
      : "",
  };
  return interpolate(USER_PROMPT_TEMPLATE, vars);
}

export function buildRegenerationPrompt(
  lead: Lead,
  mensagemAnterior: string
): string {
  const vars: Record<string, string> = {
    lead_nome: lead.nome || "N/A",
    lead_cargo: lead.cargo || "N/A",
    lead_empresa: lead.empresa || "N/A",
    lead_setor: lead.setor || "N/A",
    mensagem_anterior: mensagemAnterior,
  };
  return interpolate(REGEN_PROMPT_TEMPLATE, vars);
}

// Lead placeholder para preview quando nenhum CSV foi carregado
export const LEAD_PLACEHOLDER: Lead = {
  id: "preview",
  nome: "João Silva",
  cargo: "Diretor de Operações",
  empresa: "Acme Indústrias Ltda",
  setor: "Manufatura",
  tamanho: "150",
  cidade: "São Paulo",
  linkedin: "https://linkedin.com/in/joaosilva",
  email: "joao@acme.com.br",
  telefone: "",
  infoExtra: "",
};
