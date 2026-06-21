/**
 * Helper RPC Helius. SEMUA pemanggilan hanya boleh dari server.
 * Jangan pernah import file ini di komponen client.
 */

function rpcUrl(): string {
  const url = process.env.HELIUS_RPC_URL
  if (!url) throw new Error("HELIUS_RPC_URL belum di-set di environment")
  return url
}

let idCounter = 0

export async function heliusRpc<T = unknown>(
  method: string,
  params: unknown[],
): Promise<T> {
  const res = await fetch(rpcUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: ++idCounter,
      method,
      params,
    }),
    // RPC call cepat; jaga di bawah limit fungsi Vercel
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Helius RPC HTTP ${res.status}`)
  }

  const json = (await res.json()) as { result?: T; error?: { message: string } }
  if (json.error) throw new Error(`Helius RPC error: ${json.error.message}`)
  return json.result as T
}

// Cache sederhana getAccountInfo untuk hemat kuota (per proses, TTL pendek).
const accountCache = new Map<string, { value: unknown; ts: number }>()
const ACCOUNT_TTL_MS = 30_000

export async function getAccountInfo(pubkey: string): Promise<unknown> {
  const hit = accountCache.get(pubkey)
  if (hit && Date.now() - hit.ts < ACCOUNT_TTL_MS) return hit.value
  const value = await heliusRpc("getAccountInfo", [
    pubkey,
    { encoding: "jsonParsed", commitment: "confirmed" },
  ])
  accountCache.set(pubkey, { value, ts: Date.now() })
  return value
}
