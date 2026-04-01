"use client";

import { useState } from "react";
import { Settings, Eye, EyeOff } from "lucide-react";
import { Canal, Config, Metodologia, Tom } from "@/lib/types";

interface Props {
  config: Config;
  onChange: (config: Config) => void;
}

export default function ConfigPanel({ config, onChange }: Props) {
  const [showKey, setShowKey] = useState(false);

  function update<K extends keyof Config>(key: K, value: Config[K]) {
    onChange({ ...config, [key]: value });
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Settings size={20} className="text-blue-600" />
        2. Configurações
      </h2>

      <div className="space-y-4">
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
              onChange={(e) =>
                update("metodologia", e.target.value as Metodologia)
              }
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
              Limite de caracteres: {config.limiteCaracteres}
            </label>
            <input
              type="range"
              min={300}
              max={1500}
              step={50}
              value={config.limiteCaracteres}
              onChange={(e) =>
                update("limiteCaracteres", Number(e.target.value))
              }
              className="w-full mt-2 accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>300</span>
              <span>1500</span>
            </div>
          </div>
        </div>

        {/* Methodology description */}
        <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
          {config.metodologia === "CLÁSSICA" ? (
            <>
              <strong>Clássica:</strong> Problema → Solução → Benefícios →
              Diferencial → CTA
            </>
          ) : (
            <>
              <strong>AIDA:</strong> Atenção → Interesse → Desejo → Ação
            </>
          )}
        </div>
      </div>
    </div>
  );
}
