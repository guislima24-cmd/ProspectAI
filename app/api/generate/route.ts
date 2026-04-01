import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt, buildUserPrompt, buildRegenerationPrompt } from "@/lib/promptBuilder";
import { GenerateRequest, GenerateResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { lead, config, mensagemAnterior } = body;

  if (!config.apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  if (!lead.empresa && !lead.nome) {
    return NextResponse.json({ error: "Lead must have at least a name or company" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: config.apiKey });

  const systemPrompt = buildSystemPrompt(config);
  const userPrompt = mensagemAnterior
    ? buildRegenerationPrompt(lead, mensagemAnterior)
    : buildUserPrompt(lead);

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      message.content[0]?.type === "text" ? message.content[0].text : "";

    const response: GenerateResponse = { message: text.trim() };
    return NextResponse.json(response);
  } catch (err) {
    const error = err as { status?: number; message?: string };
    if (error.status === 401) {
      return NextResponse.json(
        { error: "API key inválida. Verifique sua chave Anthropic." },
        { status: 401 }
      );
    }
    if (error.status === 429) {
      return NextResponse.json(
        { error: "Rate limit atingido. Aguarde alguns segundos e tente novamente." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: error.message ?? "Erro ao gerar mensagem" },
      { status: 500 }
    );
  }
}
