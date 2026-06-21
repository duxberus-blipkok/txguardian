import { decodeTransaction } from "./parser"
import { simulate } from "./simulate"
import { enrichDiff } from "./diff"
import { evaluate } from "./rules"
import { explainFindings } from "./llm"
import { buildReceipt } from "./receipt"
import { persistReceipt } from "./supabase"
import type { AnalysisResult } from "./types"

/**
 * Orkestrator utama: parse -> simulate -> diff -> rules -> llm -> receipt.
 * Hanya dipanggil dari server (Route Handler).
 */
export async function analyzeTransaction(
  transactionBase64: string,
  walletPubkey?: string,
): Promise<AnalysisResult> {
  const { tx, decoded } = decodeTransaction(transactionBase64)

  const rawSim = await simulate(tx, decoded)
  const simulation = enrichDiff(rawSim, decoded)

  const { verdict, findings } = evaluate(decoded, simulation)

  const explanation = await explainFindings(verdict, findings)
  const receipt = buildReceipt(transactionBase64, verdict, findings)

  const result: AnalysisResult = {
    verdict,
    findings,
    decoded,
    simulation,
    explanation,
    receipt,
  }

  // Best-effort persist; jangan blok respons jika gagal.
  try {
    await persistReceipt(result, walletPubkey)
  } catch {
    // diabaikan untuk MVP
  }

  return result
}
