# 🛡️ TxGuardian

Lapisan keamanan sebelum menandatangani transaksi Solana. Decode, simulasi, deteksi instruksi berbahaya, jelaskan risiko dalam bahasa sederhana, lalu beri keputusan **Safe / Warning / Block**. Keputusan tanda tangan tetap di tangan pengguna.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind**
- **@solana/web3.js** — decode + simulateTransaction
- **Zod** — validasi input
- **OpenRouter (`minimax/minimax-m3`)** — LLM explainer
- **Supabase** — receipt & log (opsional)
- Deploy: **Vercel Hobby (non-komersial)**

## Arsitektur

```
UI (client)  ──POST /api/analyze──►  Route Handler (server)
                                       │
                                       ├─ parser.ts    decode tx base64
                                       ├─ simulate.ts  Helius simulateTransaction
                                       ├─ diff.ts      hitung delta
                                       ├─ rules.ts     verdict deterministik
                                       ├─ llm.ts        narasi (OpenRouter)
                                       ├─ receipt.ts   signed risk receipt
                                       └─ supabase.ts  persist (opsional)
```

Prinsip inti: **verdict ditentukan rules engine deterministik, bukan LLM.** LLM hanya menarasikan.

## Setup

```bash
# 1. Install deps
npm install

# 2. Siapkan environment
cp .env.example .env.local
#   isi HELIUS_API_KEY, HELIUS_RPC_URL, OPENROUTER_API_KEY

# 3. Generate keypair penanda receipt
node scripts/gen-signer.mjs
#   salin RECEIPT_SIGNER_SECRET ke .env.local

# 4. (Opsional) buat tabel Supabase
#   jalankan supabase/schema.sql di SQL editor Supabase

# 5. Jalankan
npm run dev
```

## Environment variables

| Var | Wajib | Keterangan |
| --- | --- | --- |
| `HELIUS_API_KEY` | ya | API key Helius |
| `HELIUS_RPC_URL` | ya | URL RPC Helius lengkap dengan api-key |
| `OPENROUTER_API_KEY` | ya | Key OpenRouter (berbayar per token) |
| `OPENROUTER_MODEL` | tidak | default `minimax/minimax-m3` |
| `RECEIPT_SIGNER_SECRET` | ya | base58 secret key untuk tanda tangan receipt |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | tidak | aktifkan persist receipt/log |

> ⚠️ **Tidak ada** key yang boleh pakai prefix `NEXT_PUBLIC_`. Semua dipakai server-side saja. Di Vercel, set di Project Settings → Environment Variables. Jangan commit `.env.local`.

## Catatan MVP

- `simulate.ts` & `diff.ts` masih menyederhanakan perhitungan delta pre/post — sempurnakan dengan `getMultipleAccounts` untuk delta akurat.
- `rules.ts` memakai heuristik berbasis log + whitelist program. Kalibrasi threshold sesuai kebutuhan.
- Vercel Hobby = **non-komersial**: tanpa fee, iklan, atau donasi.

## Roadmap

- [ ] Delta saldo pre/post akurat (getMultipleAccounts)
- [ ] Parsing token balance changes (SPL)
- [ ] Registry program berbasis komunitas
- [ ] Verifikasi receipt publik / on-chain
- [ ] Ekstrak parser + rules ke Rust→WASM
