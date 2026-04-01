"use client";

import { useState, useCallback } from "react";
import { Download, Zap, Sparkles, RotateCcw } from "lucide-react";
import CSVUpload from "@/components/CSVUpload";
import ConfigPanel from "@/components/ConfigPanel";
import LeadTable from "@/components/LeadTable";
import MessageCard from "@/components/MessageCard";
import PromptPreview from "@/components/PromptPreview";
import { Config, Lead, LeadWithMessage, VariaveisEJ } from "@/lib/types";

const DEFAULT_VARIAVEIS: VariaveisEJ = {
  nomeEJ: "UFABC Júnior",
  pitchEJ: "",
  cases: "",
  custom: [],
};

const DEFAULT_CONFIG: Config = {
  apiKey: "",
  canal: "LinkedIn",
  metodologia: "CLÁSSICA",
  tom: "Consultivo",
  limiteCaracteres: 700,
  variaveis: DEFAULT_VARIAVEIS,
};

const RATE_LIMIT_DELAY = 1200;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [results, setResults] = useState<LeadWithMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  function handleLeadsLoaded(newLeads: Lead[]) {
    setLeads(newLeads);
    setResults([]);
  }

  async function generateForLead(lead: Lead, mensagemAnterior?: string): Promise<string> {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead, config, mensagemAnterior }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Erro ao gerar mensagem");
    return data.message as string;
  }

  async function generateAll() {
    if (!config.apiKey) {
      alert("Por favor, insira sua chave da API Anthropic.");
      return;
    }
    if (leads.length === 0) {
      alert("Por favor, importe um arquivo CSV com leads.");
      return;
    }

    setIsGenerating(true);
    setProgress({ done: 0, total: leads.length });

    const initial: LeadWithMessage[] = leads.map((lead) => ({
      ...lead,
      message: null,
      status: "idle",
    }));
    setResults(initial);

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];

      setResults((prev) =>
        prev.map((r) => (r.id === lead.id ? { ...r, status: "generating" } : r))
      );

      try {
        if (i > 0) await sleep(RATE_LIMIT_DELAY);
        const message = await generateForLead(lead);
        setResults((prev) =>
          prev.map((r) => (r.id === lead.id ? { ...r, message, status: "done" } : r))
        );
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
        setResults((prev) =>
          prev.map((r) =>
            r.id === lead.id ? { ...r, status: "error", error: errorMsg } : r
          )
        );
      }

      setProgress({ done: i + 1, total: leads.length });
    }

    setIsGenerating(false);
  }

  const handleRegenerate = useCallback(
    async (leadWithMsg: LeadWithMessage) => {
      setResults((prev) =>
        prev.map((r) => (r.id === leadWithMsg.id ? { ...r, status: "generating" } : r))
      );
      try {
        const message = await generateForLead(leadWithMsg, leadWithMsg.message ?? undefined);
        setResults((prev) =>
          prev.map((r) => (r.id === leadWithMsg.id ? { ...r, message, status: "done" } : r))
        );
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
        setResults((prev) =>
          prev.map((r) =>
            r.id === leadWithMsg.id ? { ...r, status: "error", error: errorMsg } : r
          )
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config]
  );

  function exportCSV() {
    const rows = results.filter((r) => r.status === "done" && r.message);
    if (rows.length === 0) return;

    const headers = ["Nome", "Cargo", "Empresa", "Setor", "Email", "LinkedIn", "Mensagem"];
    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        [
          `"${r.nome}"`,
          `"${r.cargo}"`,
          `"${r.empresa}"`,
          `"${r.setor}"`,
          `"${r.email}"`,
          `"${r.linkedin}"`,
          `"${(r.message ?? "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prospectai-mensagens-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setLeads([]);
    setResults([]);
    setProgress({ done: 0, total: 0 });
  }

  const doneCount = results.filter((r) => r.status === "done").length;
  const hasResults = results.length > 0;
  const progressPercent =
    progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const sampleLead = leads[0] ?? null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">ProspectAI</h1>
              <p className="text-xs text-gray-500">UFABC Júnior · Prospecção B2B</p>
            </div>
          </div>

          {hasResults && (
            <div className="flex items-center gap-3">
              {doneCount > 0 && (
                <button className="btn-secondary text-sm" onClick={exportCSV}>
                  <Download size={15} />
                  Exportar CSV ({doneCount})
                </button>
              )}
              <button className="btn-secondary text-sm" onClick={reset}>
                <RotateCcw size={15} />
                Reiniciar
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Setup ── */}
        {!hasResults && (
          <>
            {/* Row 1: CSV upload (full width) */}
            <div className="mb-6">
              <CSVUpload onLeadsLoaded={handleLeadsLoaded} />
            </div>

            {/* Row 2: Config (left) + Prompt Preview (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ConfigPanel config={config} onChange={setConfig} />
              <PromptPreview config={config} sampleLead={sampleLead} />
            </div>
          </>
        )}

        {/* Lead preview table */}
        {leads.length > 0 && !hasResults && (
          <div className="mb-6">
            <LeadTable leads={leads} />
          </div>
        )}

        {/* Generate CTA */}
        {leads.length > 0 && !hasResults && (
          <div className="flex justify-center mb-8">
            <button
              className="btn-primary text-base px-8 py-3"
              onClick={generateAll}
              disabled={isGenerating || !config.apiKey}
            >
              <Zap size={18} />
              Gerar {leads.length} Mensagem{leads.length !== 1 ? "s" : ""}
            </button>
          </div>
        )}

        {/* Progress bar */}
        {isGenerating && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Gerando mensagens... {progress.done}/{progress.total}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {hasResults && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Mensagens Geradas</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {doneCount} de {results.length} concluídas · {config.canal} ·{" "}
                  {config.metodologia} · {config.tom} · {config.limiteCaracteres} chars
                </p>
              </div>
              <div className="flex items-center gap-3">
                {doneCount > 0 && (
                  <button className="btn-secondary text-sm" onClick={exportCSV}>
                    <Download size={15} />
                    Exportar ({doneCount})
                  </button>
                )}
                <button className="btn-secondary text-sm" onClick={reset}>
                  <RotateCcw size={15} />
                  Reiniciar
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {results.map((r) => (
                <MessageCard key={r.id} leadWithMessage={r} onRegenerate={handleRegenerate} />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {leads.length === 0 && !hasResults && (
          <div className="text-center py-12 text-gray-400">
            <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-500">Pronto para prospectar em escala</p>
            <p className="text-sm mt-1">Importe seu CSV do Apollo.io e configure as opções acima.</p>
          </div>
        )}
      </main>
    </div>
  );
}
