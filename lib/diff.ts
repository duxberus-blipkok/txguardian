import type { SimulationResult, DecodedTx } from "./types"

/**
 * Diff Engine: menyempurnakan hasil simulasi.
 * MVP: deteksi authority change & approval dari log + instruksi.
 * Ganti placeholder ini dengan perbandingan pre/post yang akurat.
 */
export function enrichDiff(
  sim: SimulationResult,
  decoded: DecodedTx,
): SimulationResult {
  const authorityChanges = sim.authorityChanges.slice()

  // Heuristik sederhana berbasis log program.
  for (const log of sim.logs) {
    if (/SetAuthority/i.test(log)) {
      authorityChanges.push({
        account: decoded.feePayer,
        field: "authority",
        before: null,
        after: null,
      })
    }
  }

  return { ...sim, authorityChanges }
}
