import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { AnalysisResult } from "./types"

/**
 * Klien Supabase server-side (service role). Opsional untuk MVP.
 * Hanya panggil dari server.
 */
let client: SupabaseClient | null = null

function getClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  if (!client) client = createClient(url, key, { auth: { persistSession: false } })
  return client
}

export async function persistReceipt(
  result: AnalysisResult,
  walletPubkey?: string,
): Promise<void> {
  const supabase = getClient()
  if (!supabase) return // diam-diam skip bila Supabase belum dikonfigurasi

  await supabase.from("receipts").insert({
    tx_hash: result.receipt.txHash,
    verdict: result.verdict,
    findings: result.findings,
    rules_version: result.receipt.rulesVersion,
    signature: result.receipt.signatureBase58,
  })

  await supabase.from("analysis_logs").insert({
    wallet_pubkey: walletPubkey ?? null,
    verdict: result.verdict,
  })
}
