import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "txguardian",
    hasHelius: Boolean(process.env.HELIUS_RPC_URL),
    hasOpenRouter: Boolean(process.env.OPENROUTER_API_KEY),
    hasSigner: Boolean(process.env.RECEIPT_SIGNER_SECRET),
  })
}
