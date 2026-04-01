"use client";

import { useState } from "react";
import {
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
} from "lucide-react";
import { LeadWithMessage } from "@/lib/types";

interface Props {
  leadWithMessage: LeadWithMessage;
  onRegenerate: (lead: LeadWithMessage) => void;
}

export default function MessageCard({ leadWithMessage, onRegenerate }: Props) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const { lead: _lead, ...rest } = { lead: leadWithMessage, ...leadWithMessage };
  void _lead; void rest;
  const { nome, cargo, empresa, setor, message, status, error } = leadWithMessage;

  async function copyMessage() {
    if (!message) return;
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const charCount = message?.length ?? 0;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {nome || <span className="text-gray-400 italic">Sem nome</span>}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
              {cargo && <span>{cargo}</span>}
              {cargo && empresa && <span>·</span>}
              {empresa && (
                <span className="flex items-center gap-1">
                  <Building2 size={10} />
                  {empresa}
                </span>
              )}
              {setor && <span className="text-purple-600">· {setor}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {status === "generating" && (
            <span className="flex items-center gap-1 text-xs text-blue-600">
              <Loader2 size={14} className="animate-spin" />
              Gerando...
            </span>
          )}
          {status === "done" && message && (
            <span className="text-xs text-gray-400">{charCount} chars</span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle size={14} />
              Erro
            </span>
          )}
          {expanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-4">
          {status === "idle" && (
            <p className="text-sm text-gray-400 italic text-center py-4">
              Aguardando geração...
            </p>
          )}

          {status === "generating" && (
            <div className="flex items-center justify-center py-8 gap-2 text-blue-600">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Escrevendo mensagem personalizada...</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-3">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error ?? "Erro desconhecido"}</span>
            </div>
          )}

          {status === "done" && message && (
            <>
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-100">
                {message}
              </pre>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">
                  {charCount} caracteres
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="btn-secondary text-xs py-1.5 px-3"
                    onClick={() => onRegenerate(leadWithMessage)}
                  >
                    <RefreshCw size={13} />
                    Regenerar
                  </button>
                  <button
                    className="btn-primary text-xs py-1.5 px-3"
                    onClick={copyMessage}
                  >
                    {copied ? (
                      <>
                        <Check size={13} />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
