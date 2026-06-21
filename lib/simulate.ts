import type { VersionedTransaction } from "@solana/web3.js"
import { heliusRpc } from "./helius"
import type { DecodedTx, SimulationResult, BalanceDelta, TokenDelta } from "./types"

interface RpcSimResponse {
  value: {
    err: unknown
    logs: string[] | null
    accounts:
      | Array<{
          lamports: number
          owner: string
          data: unknown
        } | null>
      | null
  }
}

/**
 * Jalankan simulateTransaction dan hitung delta saldo.
 * Catatan: pemetaan token & authority disederhanakan untuk MVP.
 */
export async function simulate(
  tx: VersionedTransaction,
  decoded: DecodedTx,
): Promise<SimulationResult> {
  const serialized = Buffer.from(tx.serialize()).toString("base64")
  const addresses = decoded.writableAccounts

  const res = await heliusRpc<RpcSimResponse>("simulateTransaction", [
    serialized,
    {
      sigVerify: false,
      replaceRecentBlockhash: true,
      encoding: "base64",
      accounts: { encoding: "jsonParsed", addresses },
    },
  ])

  const value = res.value
  const postAccounts = value.accounts ?? []

  // TODO: ambil preBalances via getMultipleAccounts utk delta akurat.
  // Untuk skeleton, delta diisi 0 dan disempurnakan di Diff Engine.
  const solDeltas: BalanceDelta[] = addresses.map((account, i) => ({
    account,
    solDelta: postAccounts[i]?.lamports ?? 0,
  }))

  const tokenDeltas: TokenDelta[] = []

  return {
    err: value.err,
    logs: value.logs ?? [],
    solDeltas,
    tokenDeltas,
    authorityChanges: [],
  }
}
