export type Verdict = "Safe" | "Warning" | "Block"

export interface Finding {
  /** Stable code, e.g. "AUTHORITY_CHANGE" */
  code: string
  severity: Verdict
  /** Short human-readable title */
  title: string
  /** Extra structured context for UI / LLM */
  detail?: Record<string, unknown>
}

export interface BalanceDelta {
  account: string
  /** lamports delta (post - pre) */
  solDelta: number
}

export interface TokenDelta {
  account: string
  mint: string
  /** ui amount delta (post - pre) */
  amountDelta: number
}

export interface AuthorityChange {
  account: string
  field: string
  before: string | null
  after: string | null
}

export interface DecodedTx {
  version: "legacy" | 0
  feePayer: string
  signers: string[]
  writableAccounts: string[]
  programIds: string[]
  instructions: Array<{
    programId: string
    accounts: string[]
    dataBase64: string
  }>
}

export interface SimulationResult {
  err: unknown
  logs: string[]
  solDeltas: BalanceDelta[]
  tokenDeltas: TokenDelta[]
  authorityChanges: AuthorityChange[]
}

export interface AnalysisResult {
  verdict: Verdict
  findings: Finding[]
  decoded: DecodedTx
  simulation: SimulationResult
  explanation: string
  receipt: SignedReceipt
}

export interface SignedReceipt {
  txHash: string
  verdict: Verdict
  rulesVersion: string
  createdAt: string
  signerPubkey: string
  signatureBase58: string
}
