import OpenAI from "openai"
import type { Finding, Verdict } from "./types"

/**
 * LLM Explainer via OpenRouter (OpenAI-compatible).
 * Hanya dipanggil dari server. Model: minimax/minimax-m3.
 * Guardrail: LLM TIDAK boleh mengubah verdict; hanya menarasikan temuan.
 */
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "",
    "X-Title": process.env.OPENROUTER_SITE_NAME ?? "TxGuardian",
  },
})

const SYSTEM_PROMPT = `You are the TxGuardian security assistant.
Your task is ONLY to explain the technical findings of the Solana transaction in simple language (English).
STRICT RULES:
- NEVER alter the provided verdict.
- DO NOT make new claims outside of the provided findings.
- Explain briefly: what happened, why it is risky, and what the user should watch out for.`

export async function explainFindings(
  verdict: Verdict,
  findings: Finding[],
): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    return "(LLM explainer inactive: OPENROUTER_API_KEY is not set.)"
  }

  const res = await client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL ?? "minimax/minimax-m3",
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify({ verdict, findings }, null, 2),
      },
    ],
  })

  return res.choices[0]?.message?.content ?? "(No explanation.)"
}
