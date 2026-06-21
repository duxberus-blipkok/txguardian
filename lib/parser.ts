import { VersionedTransaction, PublicKey } from "@solana/web3.js"
import type { DecodedTx } from "./types"

/**
 * Decode serialized transaction (base64) menjadi struktur yang mudah dianalisis.
 * Mendukung VersionedTransaction (v0) dan legacy.
 */
export function decodeTransaction(base64: string): {
  tx: VersionedTransaction
  decoded: DecodedTx
} {
  const raw = Buffer.from(base64, "base64")
  const tx = VersionedTransaction.deserialize(raw)
  const msg = tx.message

  const accountKeys = msg.staticAccountKeys.map((k: PublicKey) => k.toBase58())
  const header = msg.header
  const numSigners = header.numRequiredSignatures

  const signers = accountKeys.slice(0, numSigners)
  const feePayer = accountKeys[0] ?? ""

  // writable = signer-writable + non-signer-writable (perkiraan dari header)
  const writableAccounts: string[] = []
  accountKeys.forEach((key, i) => {
    const isSigner = i < numSigners
    const readonlySigner = i >= numSigners - header.numReadonlySignedAccounts && isSigner
    const readonlyUnsigned =
      i >= accountKeys.length - header.numReadonlyUnsignedAccounts
    const writable = isSigner ? !readonlySigner : !readonlyUnsigned
    if (writable) writableAccounts.push(key)
  })

  const instructions = msg.compiledInstructions.map((ix) => ({
    programId: accountKeys[ix.programIdIndex] ?? "",
    accounts: ix.accountKeyIndexes.map((idx) => accountKeys[idx] ?? ""),
    dataBase64: Buffer.from(ix.data).toString("base64"),
  }))

  const programIds = Array.from(new Set(instructions.map((i) => i.programId)))

  const decoded: DecodedTx = {
    version: msg.version === "legacy" ? "legacy" : 0,
    feePayer,
    signers,
    writableAccounts,
    programIds,
    instructions,
  }

  return { tx, decoded }
}
