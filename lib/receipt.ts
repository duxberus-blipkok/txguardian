import nacl from "tweetnacl"
import bs58 from "bs58"
import { createHash } from "crypto"
import { RULES_VERSION } from "./rules"
import type { Verdict, Finding, SignedReceipt } from "./types"

/**
 * Buat signed risk receipt. Ditandatangani server dengan keypair khusus app.
 * RECEIPT_SIGNER_SECRET = base58 dari 64-byte secret key.
 */
export function buildReceipt(
  transactionBase64: string,
  verdict: Verdict,
  findings: Finding[],
): SignedReceipt {
  const secret = process.env.RECEIPT_SIGNER_SECRET
  if (!secret) throw new Error("RECEIPT_SIGNER_SECRET belum di-set")

  const secretKey = bs58.decode(secret)
  const keypair = nacl.sign.keyPair.fromSecretKey(secretKey)

  const txHash = createHash("sha256").update(transactionBase64).digest("hex")
  const createdAt = new Date().toISOString()

  const payload = JSON.stringify({
    txHash,
    verdict,
    findings: findings.map((f) => f.code),
    rulesVersion: RULES_VERSION,
    createdAt,
  })

  const signature = nacl.sign.detached(
    new TextEncoder().encode(payload),
    keypair.secretKey,
  )

  return {
    txHash,
    verdict,
    rulesVersion: RULES_VERSION,
    createdAt,
    signerPubkey: bs58.encode(keypair.publicKey),
    signatureBase58: bs58.encode(signature),
  }
}
