import Papa from "papaparse";
import { Lead } from "./types";

// Maps common Apollo.io column names to our Lead fields
const COLUMN_MAP: Record<string, keyof Lead> = {
  // Name variants
  "first name": "_firstName",
  "last name": "_lastName",
  "first_name": "_firstName",
  "last_name": "_lastName",
  nome: "nome",
  name: "nome",

  // Title / Role
  title: "cargo",
  "job title": "cargo",
  cargo: "cargo",
  role: "cargo",

  // Company
  company: "empresa",
  "company name": "empresa",
  empresa: "empresa",
  account: "empresa",

  // Industry / Sector
  industry: "setor",
  setor: "setor",
  sector: "setor",
  "company industry": "setor",

  // Employees / Size
  "# employees": "tamanho",
  employees: "tamanho",
  "number of employees": "tamanho",
  "employee count": "tamanho",
  tamanho: "tamanho",
  "company size": "tamanho",

  // Location
  city: "cidade",
  cidade: "cidade",
  location: "cidade",

  // LinkedIn
  "linkedin url": "linkedin",
  linkedin: "linkedin",
  "person linkedin url": "linkedin",
  "linkedin profile": "linkedin",

  // Email
  email: "email",
  "email address": "email",
  "work email": "email",

  // Phone
  phone: "telefone",
  "phone number": "telefone",
  telefone: "telefone",
  "mobile phone": "telefone",

  // Extra info
  "account description": "infoExtra",
  description: "infoExtra",
  notes: "infoExtra",
  "company description": "infoExtra",
  info: "infoExtra",
} as unknown as Record<string, keyof Lead>;

function normalizeKey(key: string): string {
  return key.trim().toLowerCase();
}

export function parseCSV(file: File): Promise<Lead[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const leads = mapRows(results.data as Record<string, string>[]);
          resolve(leads);
        } catch (err) {
          reject(err);
        }
      },
      error: (error) => reject(error),
    });
  });
}

function mapRows(rows: Record<string, string>[]): Lead[] {
  return rows.map((row, index) => {
    const mapped: Partial<Lead> & { _firstName?: string; _lastName?: string } =
      {
        id: String(index + 1),
      };

    for (const [rawKey, value] of Object.entries(row)) {
      const normalKey = normalizeKey(rawKey);
      const field = COLUMN_MAP[normalKey];
      if (field) {
        (mapped as Record<string, string>)[field as string] = value?.trim() ?? "";
      }
    }

    // Combine first + last name if no direct "nome" column
    if (!mapped.nome && (mapped._firstName || mapped._lastName)) {
      mapped.nome = [mapped._firstName, mapped._lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
    }

    return {
      id: mapped.id ?? String(index + 1),
      nome: mapped.nome ?? "",
      cargo: mapped.cargo ?? "",
      empresa: mapped.empresa ?? "",
      setor: mapped.setor ?? "",
      tamanho: mapped.tamanho ?? "",
      cidade: mapped.cidade ?? "",
      linkedin: mapped.linkedin ?? "",
      email: mapped.email ?? "",
      telefone: mapped.telefone ?? "",
      infoExtra: mapped.infoExtra ?? "",
    };
  });
}
