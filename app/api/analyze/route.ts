import { NextResponse } from "next/server"
import { AnalyzeRequestSchema } from "@/lib/schema"
import { analyzeTransaction } from "@/lib/analyze"

// Jalankan di Node runtime (butuh crypto & @solana/web3.js).
export const runtime = "nodejs"
export const maxDuration = 30 // detik; cukup utk 1 simulasi + LLM

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = AnalyzeRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    )
  }

  try {
    const result = await analyzeTransaction(
      parsed.data.transactionBase64,
      parsed.data.walletPubkey,
    )
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
