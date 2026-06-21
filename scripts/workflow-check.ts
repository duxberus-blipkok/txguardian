/**
 * Cek workflow end-to-end (OFFLINE).
 * Memakai modul ASLI yang bebas dependency: diff.ts + rules.ts.
 * Batas jaringan (parser/simulate/llm/receipt) di-MOCK sesuai kontrak tipe
 * yang sama, mengikuti urutan persis di lib/analyze.ts.
 *
 * Jalankan: npx tsx scripts/workflow-check.ts
 */
import { enrichDiff } from "../lib/diff" // ASLI
import { evaluate, RULES_VERSION } from "../lib/rules" // ASLI
import type {
  DecodedTx,
  SimulationResult,
  AnalysisResult,
  Verdict,
  Finding,
  SignedReceipt,
} from "../lib/types"

const SYSTEM = "11111111111111111111111111111111"
const SPL = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
const SCAM = "Scam1111111111111111111111111111111111111111"

// ---- MOCK: parser.ts (asli butuh @solana/web3.js) ----
function mockDecode(scenario: string): DecodedTx {
  const base: DecodedTx = {
    version: 0,
    feePayer: "Fee11111111111111111111111111111111111111",
    signers: ["Fee11111111111111111111111111111111111111"],
    writableAccounts: ["A1", "A2"],
    programIds: [SYSTEM],
    instructions: [],
  }
  if (scenario === "drainer")
    return { ...base, programIds: [SPL], writableAccounts: ["A1", "A2", "A3"] }
  if (scenario === "takeover")
    return { ...base, programIds: [SCAM], writableAccounts: ["A1", "A2", "A3", "A4"] }
  return base
}

// ---- MOCK: simulate.ts (asli butuh Helius RPC) ----
function mockSimulate(scenario: string): SimulationResult {
  const base: SimulationResult = {
    err: null,
    logs: ["Program 111 invoke [1]", "Program 111 success"],
    solDeltas: [{ account: "A1", solDelta: -5000 }],
    tokenDeltas: [],
    authorityChanges: [],
  }
  if (scenario === "drainer")
    return {
      ...base,
      logs: [
        "Program log: Instruction: CloseAccount",
        "Program log: Instruction: CloseAccount",
      ],
    }
  if (scenario === "takeover")
    return {
      ...base,
      logs: ["Program log: Instruction: SetAuthority", "Program log: Instruction: Approve"],
      authorityChanges: [
        { account: "A1", field: "authority", before: "OldOwner", after: "Attacker" },
      ],
    }
  return base
}

// ---- MOCK: llm.ts (asli butuh OpenRouter) ----
async function mockExplain(verdict: Verdict, findings: Finding[]): Promise<string> {
  return `[MOCK LLM] Verdict ${verdict}. ${findings.length} temuan: ${findings
    .map((f) => f.title)
    .join("; ")}`
}

// ---- MOCK: receipt.ts (asli butuh tweetnacl/bs58/env) ----
function mockReceipt(verdict: Verdict): SignedReceipt {
  return {
    txHash: "deadbeef",
    verdict,
    rulesVersion: RULES_VERSION,
    createdAt: new Date().toISOString(),
    signerPubkey: "MockSigner111",
    signatureBase58: "MockSig111",
  }
}

// ---- Replikasi urutan analyze.ts ----
async function runWorkflow(scenario: string): Promise<AnalysisResult> {
  const decoded = mockDecode(scenario) //   1. parse
  const rawSim = mockSimulate(scenario) //  2. simulate
  const simulation = enrichDiff(rawSim, decoded) // 3. diff (ASLI)
  const { verdict, findings } = evaluate(decoded, simulation) // 4. rules (ASLI)
  const explanation = await mockExplain(verdict, findings) //    5. llm
  const receipt = mockReceipt(verdict) //   6. receipt
  return { verdict, findings, decoded, simulation, explanation, receipt }
}

const REQUIRED_KEYS: (keyof AnalysisResult)[] = [
  "verdict",
  "findings",
  "decoded",
  "simulation",
  "explanation",
  "receipt",
]

const scenarios: Array<{ name: string; key: string; expect: Verdict }> = [
  { name: "Normal transfer", key: "normal", expect: "Safe" },
  { name: "Wallet drainer", key: "drainer", expect: "Block" },
  { name: "Account takeover", key: "takeover", expect: "Block" },
]

const main = async () => {
  console.log(`TxGuardian WORKFLOW CHECK (offline, rules v${RULES_VERSION})`)
  console.log(`Pipeline: parse → simulate → diff → rules → llm → receipt\n`)
  let pass = 0
  for (const s of scenarios) {
    const out = await runWorkflow(s.key)
    const shapeOk = REQUIRED_KEYS.every((k) => out[k] !== undefined)
    const verdictOk = out.verdict === s.expect
    const receiptOk = out.receipt.verdict === out.verdict // konsistensi
    const ok = shapeOk && verdictOk && receiptOk
    if (ok) pass++
    console.log(`${ok ? "✅" : "❌"} ${s.name}`)
    console.log(`     verdict=${out.verdict} (expect ${s.expect}) | findings=${out.findings.length} | shape=${shapeOk ? "ok" : "MISSING"} | receipt.verdict=${out.receipt.verdict}`)
    console.log(`     explanation: ${out.explanation}`)
  }
  console.log(`\nWorkflow result: ${pass}/${scenarios.length} passed`)
  if (pass !== scenarios.length) process.exit(1)
}

main()
