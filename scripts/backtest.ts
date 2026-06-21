/**
 * Backtest ringan untuk rules engine (deterministik, tanpa RPC).
 * Jalankan: npx tsx scripts/backtest.ts
 */
import { evaluate, RULES_VERSION } from "../lib/rules"
import type { DecodedTx, SimulationResult, Verdict } from "../lib/types"

const SYSTEM = "11111111111111111111111111111111"
const SPL_TOKEN = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
const SCAM = "Scam1111111111111111111111111111111111111111"

function tx(p: Partial<DecodedTx> = {}): DecodedTx {
  return {
    version: 0,
    feePayer: "Fee1111111111111111111111111111111111111111",
    signers: ["Fee1111111111111111111111111111111111111111"],
    writableAccounts: ["A1"],
    programIds: [SYSTEM],
    instructions: [],
    ...p,
  }
}

function sim(p: Partial<SimulationResult> = {}): SimulationResult {
  return {
    err: null,
    logs: [],
    solDeltas: [],
    tokenDeltas: [],
    authorityChanges: [],
    ...p,
  }
}

interface Case {
  name: string
  decoded: DecodedTx
  simulation: SimulationResult
  expected: Verdict
  expectCodes?: string[]
}

const cases: Case[] = [
  {
    name: "Normal SOL transfer (known program)",
    decoded: tx({ programIds: [SYSTEM], writableAccounts: ["A1", "A2"] }),
    simulation: sim({ logs: ["Program 111 invoke", "Program 111 success"] }),
    expected: "Safe",
  },
  {
    name: "Unknown program, narrow access",
    decoded: tx({ programIds: [SCAM], writableAccounts: ["A1"] }),
    simulation: sim(),
    expected: "Warning",
    expectCodes: ["UNKNOWN_PROGRAM"],
  },
  {
    name: "Token approval / delegation",
    decoded: tx({ programIds: [SPL_TOKEN] }),
    simulation: sim({ logs: ["Program log: Instruction: Approve"] }),
    expected: "Warning",
    expectCodes: ["TOKEN_APPROVAL"],
  },
  {
    name: "Failed simulation",
    decoded: tx(),
    simulation: sim({ err: { InstructionError: [0, "Custom"] } }),
    expected: "Warning",
    expectCodes: ["SIM_ERROR"],
  },
  {
    name: "Authority transfer (SetAuthority)",
    decoded: tx({ programIds: [SPL_TOKEN] }),
    simulation: sim({
      authorityChanges: [
        { account: "A1", field: "authority", before: null, after: null },
      ],
    }),
    expected: "Block",
    expectCodes: ["AUTHORITY_CHANGE"],
  },
  {
    name: "Drainer pattern (bulk closeAccount)",
    decoded: tx({ programIds: [SPL_TOKEN] }),
    simulation: sim({
      logs: [
        "Program log: Instruction: CloseAccount",
        "Program log: Instruction: CloseAccount",
      ],
    }),
    expected: "Block",
    expectCodes: ["DRAINER_PATTERN"],
  },
  {
    name: "Unknown program + wide write access",
    decoded: tx({ programIds: [SCAM], writableAccounts: ["A1", "A2", "A3", "A4"] }),
    simulation: sim(),
    expected: "Block",
    expectCodes: ["UNKNOWN_PROGRAM_WIDE_ACCESS"],
  },
  {
    name: "Mixed: approval + authority change => highest verdict",
    decoded: tx({ programIds: [SPL_TOKEN] }),
    simulation: sim({
      logs: ["Program log: Instruction: Approve"],
      authorityChanges: [
        { account: "A1", field: "authority", before: null, after: null },
      ],
    }),
    expected: "Block",
    expectCodes: ["TOKEN_APPROVAL", "AUTHORITY_CHANGE"],
  },
]

let pass = 0
const rows: string[] = []
for (const c of cases) {
  const { verdict, findings } = evaluate(c.decoded, c.simulation)
  const codes = findings.map((f) => f.code)
  const verdictOk = verdict === c.expected
  const codesOk = (c.expectCodes ?? []).every((code) => codes.includes(code))
  const ok = verdictOk && codesOk
  if (ok) pass++
  rows.push(
    `${ok ? "✅" : "❌"}  ${c.name}\n      expected=${c.expected} got=${verdict} | codes=[${codes.join(", ")}]`,
  )
}

console.log(`TxGuardian rules backtest (rules v${RULES_VERSION})\n`)
console.log(rows.join("\n"))
console.log(`\nResult: ${pass}/${cases.length} scenarios passed`)
if (pass !== cases.length) process.exit(1)
