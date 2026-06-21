# Agentic Engineering Grant Application Draft

Submit here: https://superteam.fun/earn/grants/agentic-engineering

Grant: Agentic Engineering Grants by Superteam
Amount shown on listing: 200 USDG
Status checked: Open, Global

## Step 1: Basics

**Project Title**
> TxGuardian

**One Line Description**
> TxGuardian is a pre-sign Solana transaction risk analyzer that decodes, simulates, and classifies transactions as Safe, Warning, or Block using deterministic rules plus plain-English AI explanations.

**TG username**
> t.me/<your-telegram-username>

**Wallet Address**
> <your-solana-wallet-address>

## Step 2: Details

**Project Details**
> TxGuardian protects Solana users at the moment of highest risk: right before they sign a transaction. Many wallets and dApps still ask users to approve opaque serialized transaction payloads, making it hard to understand whether the transaction is a normal transfer, a token approval, a hidden authority transfer, or a potential wallet-draining flow. TxGuardian adds a security review layer before signing so users can see a simple Safe / Warning / Block verdict while keeping the final signing decision in their own hands.

> The MVP is built as a Next.js + TypeScript app with a server-side analysis pipeline: decode a base64 Solana transaction, simulate it through Helius RPC, enrich the result with balance and authority-change analysis, run deterministic risk rules, generate a constrained LLM explanation through OpenRouter, and return a signed risk receipt. The important design choice is that the LLM never sets or changes the verdict. The verdict comes from a rules engine with explicit findings such as SIM_ERROR, UNKNOWN_PROGRAM, UNKNOWN_PROGRAM_WIDE_ACCESS, TOKEN_APPROVAL, AUTHORITY_CHANGE, and DRAINER_PATTERN.

> Current implementation includes the web UI, POST /api/analyze, GET /api/health, Zod request validation, transaction decoding with @solana/web3.js, Helius simulateTransaction integration, deterministic rule evaluation, OpenRouter-based user explanations, tweetnacl-signed receipts, optional Supabase persistence, a Supabase schema, a mock transaction generator, an offline workflow check, and a rules backtest suite. The next grant-funded push is to turn the skeleton into a more reliable public MVP by improving accurate pre/post balance diffs, SPL token delta parsing, program registry coverage, deployment polish, and repeatable evidence for Colosseum submission.

**Deadline**
> July 5, 2026, 23:59 Asia/Calcutta

**Proof of Work**
> Local project: TxGuardian, Next.js 14.2.5 + TypeScript + Tailwind app using @solana/web3.js, OpenRouter/OpenAI-compatible client, tweetnacl/bs58 signed receipts, Zod validation, and optional Supabase logging.
>
> Implemented files include app/page.tsx, components/AnalyzeForm.tsx, app/api/analyze/route.ts, app/api/health/route.ts, lib/analyze.ts, lib/parser.ts, lib/simulate.ts, lib/diff.ts, lib/rules.ts, lib/llm.ts, lib/receipt.ts, lib/supabase.ts, supabase/schema.sql, scripts/workflow-check.ts, scripts/backtest.ts, scripts/gen-test-tx.mjs, and scripts/gen-signer.mjs.
>
> Verification run on June 21, 2026: npm run build passed, npm run typecheck passed after build generated Next types, npx --yes tsx scripts/workflow-check.ts passed 3/3 scenarios, and npx --yes tsx scripts/backtest.ts passed 8/8 rules scenarios.
>
> Git history and GitHub remote were not available in the local folder because this directory is not currently a git repository. Before submitting, push the project to GitHub and add the repository link here: <github-repo-url>.

**Personal X Profile**
> x.com/<your-handle>

**Personal GitHub Profile**
> github.com/duxberus-blipkok

**Colosseum Crowdedness Score**
> Visit https://colosseum.com/copilot, search/analyze the TxGuardian idea, take a screenshot of the Crowdedness Score, upload the screenshot to a publicly accessible Google Drive link, and paste the link here: <public-google-drive-link-to-crowdedness-score-screenshot>.

**AI Session Transcript**
> Attach codex-session.jsonl from the project root: C:\Users\jauha\Documents\Antigravity_App\txguardian\codex-session.jsonl

## Step 3: Milestones

**Goals and Milestones**
> 1. June 24, 2026: Improve transaction diff accuracy by replacing placeholder SOL deltas with pre/post account comparisons and adding SPL token balance delta parsing.
>
> 2. June 27, 2026: Expand deterministic risk coverage with additional rules for token approvals, close-account flows, authority changes, unknown programs, suspicious writable account patterns, and curated known-program registry data.
>
> 3. June 30, 2026: Harden the user-facing MVP by improving result copy, error states, health checks, signed receipt display, and safe handling of missing Helius/OpenRouter/Supabase configuration.
>
> 4. July 3, 2026: Deploy a public Vercel preview with production environment variables, run analysis against a representative set of real and generated transactions, and document the verification results.
>
> 5. July 5, 2026: Finalize the Colosseum submission package with the live demo, GitHub repo, AI session transcript, Crowdedness Score screenshot, and AI subscription receipt for the final tranche.

**Primary KPI**
> Analyze at least 50 unique Solana transactions from at least 10 unique testers before final grant completion, with every analysis returning a deterministic Safe / Warning / Block verdict and signed receipt.

**Final tranche checkbox**
> I understand that to receive the final tranche I need to submit the Colosseum project link, GitHub repository, and AI subscription receipt.

## Still Needed Before Submission

- Telegram username
- Solana wallet address
- Personal X profile
- Confirm GitHub profile
- Public GitHub repository link
- Public deployment URL, if available
- Colosseum Crowdedness Score screenshot link
- AI subscription receipt
- Attach the exported AI session transcript: codex-session.jsonl

Submit here: https://superteam.fun/earn/grants/agentic-engineering
