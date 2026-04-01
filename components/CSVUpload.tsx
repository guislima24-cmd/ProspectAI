"use client";

import { useRef, useState } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { parseCSV } from "@/lib/csvParser";
import { Lead } from "@/lib/types";

interface Props {
  onLeadsLoaded: (leads: Lead[]) => void;
}

export default function CSVUpload({ onLeadsLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      setError("Por favor, envie um arquivo .csv");
      return;
    }

    setError(null);
    setFileName(file.name);

    try {
      const leads = await parseCSV(file);
      if (leads.length === 0) {
        setError("O arquivo CSV está vazio ou não contém dados válidos.");
        return;
      }
      onLeadsLoaded(leads);
    } catch {
      setError("Erro ao processar o CSV. Verifique o formato do arquivo.");
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText size={20} className="text-blue-600" />
        1. Importar Leads do Apollo.io
      </h2>

      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <Upload size={40} className="mx-auto text-gray-400 mb-3" />
        {fileName ? (
          <p className="text-sm font-medium text-blue-600">{fileName}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">
              Arraste o CSV do Apollo.io aqui
            </p>
            <p className="text-xs text-gray-500 mt-1">ou clique para selecionar</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500">
        Exportação padrão do Apollo.io. Colunas esperadas: First Name, Last
        Name, Title, Company, Industry, # Employees, City, LinkedIn Url.
      </p>
    </div>
  );
}
