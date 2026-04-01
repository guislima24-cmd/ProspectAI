import { Config, Lead } from "./types";

export function buildSystemPrompt(config: Config): string {
  return `Você é um especialista em prospecção B2B para empresas juniores universitárias.
Sua função é escrever mensagens de prospecção personalizadas, diretas e humanas
para o time comercial da UFABC Júnior.
Regras obrigatórias:
- NUNCA mencione serviços específicos (Mapeamento de Processos, Pesquisa de Mercado, etc.)
- O único objetivo da mensagem é conseguir uma reunião diagnóstica
- NUNCA use frases genéricas como "Espero que esteja bem" ou "Me chamo X e trabalho em Y"
- SEMPRE comece com algo específico sobre a empresa ou o setor do lead
- A mensagem deve parecer escrita por um humano que pesquisou o lead
- Máximo de ${config.limiteCaracteres} caracteres
- Tom: ${config.tom}
- Canal: ${config.canal}
- Metodologia: ${config.metodologia}
${buildMethodologyInstructions(config.metodologia)}
Formato de resposta: apenas o texto da mensagem, sem aspas, sem explicações adicionais.`;
}

function buildMethodologyInstructions(metodologia: Config["metodologia"]): string {
  if (metodologia === "CLÁSSICA") {
    return `Se metodologia for CLÁSSICA, estruture assim:
1. PROBLEMA: gere empatia mostrando que entende o contexto/dor do lead
2. SOLUÇÃO: apresente a UFABC Júnior como caminho lógico
3. BENEFÍCIOS: foque em resultados tangíveis, não no que fazemos mas no que entregamos
4. DIFERENCIAL: responda implicitamente "por que UFABC Júnior e não outro?"
5. CTA: convide para uma reunião diagnóstica de forma específica e com urgência`;
  }
  return `Se metodologia for AIDA, estruture assim:
1. ATENÇÃO: capture com uma dor ou pergunta provocadora sobre o setor/empresa do lead
2. INTERESSE: gere curiosidade apresentando a UFABC Júnior como solução
3. DESEJO: mostre valor e exclusividade para criar vontade de conversar
4. AÇÃO: CTA direto convidando para reunião diagnóstica`;
}

export function buildUserPrompt(lead: Lead): string {
  const lines = [
    `Escreva uma mensagem de prospecção para o seguinte lead:`,
    `- Nome: ${lead.nome || "N/A"}`,
    `- Cargo: ${lead.cargo || "N/A"}`,
    `- Empresa: ${lead.empresa || "N/A"}`,
    `- Setor: ${lead.setor || "N/A"}`,
    `- Tamanho empresa: ${lead.tamanho || "N/A"} funcionários`,
    `- Localização: ${lead.cidade || "N/A"}`,
    `- LinkedIn URL: ${lead.linkedin || "N/A"}`,
  ];

  if (lead.infoExtra?.trim()) {
    lines.push(`Contexto adicional: ${lead.infoExtra}`);
  }

  lines.push(
    `\nLembre-se: a mensagem deve parecer personalizada para essa pessoa especificamente, não um template genérico.`
  );

  return lines.join("\n");
}

export function buildRegenerationPrompt(lead: Lead, mensagemAnterior: string): string {
  return `Reescreva a mensagem abaixo de forma diferente para o mesmo lead.
Use uma abordagem ou ângulo diferente da versão anterior.
Lead: ${lead.nome} | ${lead.cargo} | ${lead.empresa} | ${lead.setor}
Versão anterior (NÃO repita esta abordagem):
${mensagemAnterior}

Escreva apenas o novo texto da mensagem, sem aspas, sem explicações adicionais.`;
}
