"use client";

import { Users, Building2, MapPin, Briefcase } from "lucide-react";
import { Lead } from "@/lib/types";

interface Props {
  leads: Lead[];
}

export default function LeadTable({ leads }: Props) {
  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users size={20} className="text-blue-600" />
          Leads Importados
        </h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {leads.length} lead{leads.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Nome
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <span className="flex items-center gap-1">
                  <Briefcase size={12} />
                  Cargo
                </span>
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <span className="flex items-center gap-1">
                  <Building2 size={12} />
                  Empresa
                </span>
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Setor
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  Cidade
                </span>
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Funcionários
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {lead.nome || <span className="text-gray-400 italic">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {lead.cargo || <span className="text-gray-400 italic">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-700 font-medium">
                  {lead.empresa || <span className="text-gray-400 italic">—</span>}
                </td>
                <td className="px-4 py-3">
                  {lead.setor ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                      {lead.setor}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{lead.cidade || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{lead.tamanho || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
