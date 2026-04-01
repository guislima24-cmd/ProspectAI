"use client";

import { useState } from "react";
import { Settings, Eye, EyeOff, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Canal, Config, Metodologia, Tom, VariavelCustom } from "@/lib/types";

interface Props {
  config: Config;
  onChange: (config: Config) => void;
}

export default function ConfigPanel({ config, onChange }: Props) {
  const [showKey, setShowKey] = useState(false);
  const [showVars, setShowVars] = useState(false);

  function update<K extends keyof Config>(key: K, value: Config[K]) {
    onChange({ ...config, [key]: value });
  }

  function updateVar<K extends keyof Config["variaveis"]>(
    key: K,
    value: Config["variaveis"][K]
  ) {
    onChange({ ...config, variaveis: { ...config.variaveis, [key]: value } });
  }

  function addCustomVar() {
    updateVar("custom", [...config.variaveis.custom, { chave: "", valor: "" }]);
  }

  function updateCustomVar(index: number, field: keyof VariavelCustom, value: string) {
    const updated = config.variaveis.custom.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    );
    updateVar("custom", updated);
  }

  function removeCustomVar(index: number) {
    updateVar("custom", config.variaveis.custom.filter((_, i) => i !== index));
  }

  return (
    <div className="card p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Settings size={20} className="text-blue-600" />
        2. Configurações
      </h2>

      {/* API Key */}
      <div>
        <label className="label">Chave da API Anthropic (Claude)</label>
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            className="input pr-10"
            placeholder="sk-ant-..."
            value={config.apiKey}
            onChange={(e) => update("apiKey", e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Sua chave não é salva — fica apenas nesta sessão.
        </p>
      </div>

      {/* Canal + Metodologia */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Canal</label>
          <select
            className="input"
            value={config.canal}
            onChange={(e) => update("canal", e.target.value as Canal)}
          >
            <option value="LinkedIn">LinkedIn</option>
            <option value="E-mail">E-mail</option>
          </select>
        </div>
        <div>
          <label className="label">Metodologia</label>
          <select
            className="input"
            value={config.metodologia}
            onChange={(e) => update("metodologia", e.target.value as Metodologia)}
          >
            <option value="CLÁSSICA">Clássica</option>
            <option value="AIDA">AIDA</option>
          </select>
        </div>
      </div>

      {/* Tom + Limite */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Tom</label>
          <select
            className="input"
            value={config.tom}
            onChange={(e) => update("tom", e.target.value as Tom)}
          >
            <option value="Profissional">Profissional</option>
            <option value="Direto">Direto</option>
            <option value="Consultivo">Consultivo</option>
            <option value="Provocador">Provocador</option>
          </select>
        </div>
        <div>
          <label className="label">
            Limite: {config.limiteCaracteres} chars
          </label>
          <input
            type="range"
            min={300}
            max={1500}
            step={50}
            value={config.limiteCaracteres}
            onChange={(e) => update("limiteCaracteres", Number(e.target.value))}
            className="w-full mt-2 accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>300</span>
            <span>1500</span>
          </div>
        </div>
      </div>

      {/* Methodology hint */}
      <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
        {config.metodologia === "CLÁSSICA" ? (
          <><strong>Clássica:</strong> Problema → Solução → Benefícios → Diferencial → CTA</>
        ) : (
          <><strong>AIDA:</strong> Atenção → Interesse → Desejo → Ação</>
        )}
      </div>

      {/* ── Variáveis da EJ ── */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowVars(!showVars)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
        >
          <span className="flex items-center gap-2">
            <span className="text-base">✦</span>
            Variáveis do Prompt
          </span>
          {showVars ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showVars && (
          <div className="p-4 space-y-4">
            <p className="text-xs text-gray-500">
              Estas variáveis são injetadas no prompt enviado ao Claude.
              Aparecem destacadas na pré-visualização.
            </p>

            {/* Nome da EJ */}
            <div>
              <label className="label">
                Nome da EJ{" "}
                <code className="ml-1 text-xs bg-gray-100 px-1 rounded">
                  {"{{nome_ej}}"}
                </code>
              </label>
              <input
                type="text"
                className="input"
                placeholder="UFABC Júnior"
                value={config.variaveis.nomeEJ}
                onChange={(e) => updateVar("nomeEJ", e.target.value)}
              />
            </div>

            {/* Pitch / Contexto */}
            <div>
              <label className="label">
                Pitch / Contexto da EJ{" "}
                <code className="ml-1 text-xs bg-gray-100 px-1 rounded">
                  {"{{secao_contexto}}"}
                </code>
              </label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Ex: somos uma empresa júnior que conecta talentos da UFABC com empresas para entregar projetos estratégicos com qualidade consultiva e custo acessível."
                value={config.variaveis.pitchEJ}
                onChange={(e) => updateVar("pitchEJ", e.target.value)}
              />
            </div>

            {/* Cases */}
            <div>
              <label className="label">
                Cases / Resultados{" "}
                <code className="ml-1 text-xs bg-gray-100 px-1 rounded">
                  {"{{secao_contexto}}"}
                </code>
              </label>
              <textarea
                className="input resize-none"
                rows={2}
                placeholder="Ex: reduzimos em 30% o tempo de ciclo de uma indústria em Santo André."
                value={config.variaveis.cases}
                onChange={(e) => updateVar("cases", e.target.value)}
              />
            </div>

            {/* Variáveis custom */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Variáveis extras</label>
                <button
                  type="button"
                  onClick={addCustomVar}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={13} />
                  Adicionar
                </button>
              </div>

              {config.variaveis.custom.length === 0 && (
                <p className="text-xs text-gray-400 italic">
                  Nenhuma variável extra. Use para adicionar contexto livre ao prompt.
                </p>
              )}

              <div className="space-y-2">
                {config.variaveis.custom.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      className="input w-32 flex-shrink-0 font-mono text-xs"
                      placeholder="chave"
                      value={v.chave}
                      onChange={(e) => updateCustomVar(i, "chave", e.target.value)}
                    />
                    <input
                      type="text"
                      className="input flex-1 text-xs"
                      placeholder="valor"
                      value={v.valor}
                      onChange={(e) => updateCustomVar(i, "valor", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomVar(i)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
