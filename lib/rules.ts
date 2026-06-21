import type { DecodedTx, SimulationResult, Finding, Verdict } from "./types"

export const RULES_VERSION = "0.1.0"

// Program ID Solana yang umum & tepercaya (whitelist minimal).
const KNOWN_PROGRAMS = new Set<string>([
  "11111111111111111111111111111111", // System Program
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", // SPL Token
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", // Token-2022
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL", // Associated Token
  "ComputeBudget111111111111111111111111111111",
])

const SEVERITY_ORDER: Record<Verdict, number> = { Safe: 0, Warning: 1, Block: 2 }

/**
 * Rules engine deterministik. Tidak melibatkan LLM.
 * Mengembalikan daftar temuan + verdict akhir (severity tertinggi).
 */
export function evaluate(
  decoded: DecodedTx,
  sim: SimulationResult,
): { verdict: Verdict; findings: Finding[] } {
  const findings: Finding[] = []

  // R1: simulasi gagal
  if (sim.err) {
    findings.push({
      code: "SIM_ERROR",
      severity: "Warning",
      title: "Transaction simulation failed",
      detail: { err: sim.err },
    })
  }

  // R2: perpindahan authority => Block
  if (sim.authorityChanges.length > 0) {
    findings.push({
      code: "AUTHORITY_CHANGE",
      severity: "Block",
      title: "Account authority transfer detected",
      detail: { changes: sim.authorityChanges },
    })
  }

  // R3: program tidak dikenal dengan akses writable luas
  const unknownPrograms = decoded.programIds.filter((p) => !KNOWN_PROGRAMS.has(p))
  if (unknownPrograms.length > 0 && decoded.writableAccounts.length >= 3) {
    findings.push({
      code: "UNKNOWN_PROGRAM_WIDE_ACCESS",
      severity: "Block",
      title: "Unknown program with wide write access",
      detail: { unknownPrograms, writableCount: decoded.writableAccounts.length },
    })
  } else if (unknownPrograms.length > 0) {
    findings.push({
      code: "UNKNOWN_PROGRAM",
      severity: "Warning",
      title: "Transaction calls an unknown program",
      detail: { unknownPrograms },
    })
  }

  // R4: pola drainer (banyak closeAccount via log)
  const closeCount = sim.logs.filter((l) => /CloseAccount/i.test(l)).length
  if (closeCount >= 2) {
    findings.push({
      code: "DRAINER_PATTERN",
      severity: "Block",
      title: "Wallet drainer pattern (bulk CloseAccount)",
      detail: { closeCount },
    })
  }

  // R5: token approval / delegation
  if (sim.logs.some((l) => /Approve/i.test(l))) {
    findings.push({
      code: "TOKEN_APPROVAL",
      severity: "Warning",
      title: "Transaction grants token approval/delegation",
    })
  }

  const verdict = findings.reduce<Verdict>((acc, f) => {
    return SEVERITY_ORDER[f.severity] > SEVERITY_ORDER[acc] ? f.severity : acc
  }, "Safe")

  return { verdict, findings }
}
