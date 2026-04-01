"use client";

import { useState, useMemo } from "react";
import { Eye } from "lucide-react";
import {
  SYSTEM_PROMPT_TEMPLATE,
  USER_PROMPT_TEMPLATE,
  buildVarsMap,
} from "@/lib/promptBuilder";
import { Config, Lead } from "@/lib/types";

interface Props {
  config: Config;
  sampleLead: Lead | null; // primeiro lead do CSV, ou null
}

type Tab = "sistema" | "usuario";

// Nomes das variáveis que o usuário configurou diretamente (para highlight)
const USER_CONTROLLED_VARS = new Set([
  "nome_ej",
  "secao_contexto",
  "limite_caracteres",
  "tom",
  "canal",
  "metodologia",
]);

/** Renderiza o template com variáveis destacadas. */
function HighlightedPrompt({
  template,
  vars,
}: {
  template: string;
  vars: Record<string, string>;
}) {
  const parts = template.split(/(\{\{[^}]+\}\})/g);

  const nodes = parts.map((part, i) => {
    const match = part.match(/^\{\{([^}]+)\}\}$/);
    if (!match) return <span key={i}>{part}</span>;

    const key = match[1];
    const value = vars[key];

    if (!value && value !== "") {
      // variável sem valor definido
      return (
        <mark
          key={i}
          className="bg-red-100 text-red-500 rounded px-0.5 text-xs"
        >
          {part}
        </mark>
      );
    }

    if (!value.trim()) return null; // variável vazia — omite o espaço

    const isUserVar = USER_CONTROLLED_VARS.has(key);

    return (
      <mark
        key={i}
        className={
          isUserVar
            ? "bg-blue-100 text-blue-800 rounded px-0.5"
            : "bg-amber-100 text-amber-800 rounded px-0.5"
        }
      >
        {value}
      </mark>
    );
  });

  return (
    <pre className="whitespace-pre-wrap text-xs text-gray-700 font-sans leading-relaxed">
      {nodes}
    </pre>
  );
}

export default function PromptPreview({ config, sampleLead }: Props) {
  const [tab, setTab] = useState<Tab>("sistema");

  const lead = sampleLead ?? {
    id: "preview",
    nome: "João Silva",
    cargo: "Diretor de Operações",
    empresa: "Acme Indústrias Ltda",
    setor: "Manufatura",
    tamanho: "150",
    cidade: "São Paulo",
    linkedin: "https://linkedin.com/in/joaosilva",
    email: "",
    telefone: "",
    infoExtra: "",
  };

  const vars = useMemo(() => buildVarsMap(config, lead), [config, lead]);

  const template =
    tab === "sistema" ? SYSTEM_PROMPT_TEMPLATE : USER_PROMPT_TEMPLATE;

  // Caracteres do prompt interpolado
  const interpolated = template.replace(
    /\{\{([^}]+)\}\}/g,
    (_, k) => vars[k] ?? ""
  );
  const charCount = interpolated.length;

  return (
    <div className="card flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <Eye size={16} className="text-blue-600" />
          Pré-visualização do Prompt
        </h2>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["sistema", "usuario"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "sistema" ? "Prompt do Sistema" : "Prompt do Usuário"}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!sampleLead && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-3">
            Importe um CSV para ver o prompt com dados reais do lead.
            Mostrando exemplo.
          </p>
        )}
        <HighlightedPrompt template={template} vars={vars} />
      </div>

      {/* Footer: legend + char count */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <mark className="bg-blue-100 text-blue-800 rounded px-1">■</mark>
            Configuração
          </span>
          <span className="flex items-center gap-1">
            <mark className="bg-amber-100 text-amber-800 rounded px-1">■</mark>
            Lead
          </span>
        </div>
        <span className="text-xs text-gray-400">{charCount} chars</span>
      </div>
    </div>
  );
}
