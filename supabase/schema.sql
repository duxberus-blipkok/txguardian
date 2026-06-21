-- TxGuardian — skema Supabase (opsional untuk MVP)

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  tx_hash text not null,
  verdict text not null check (verdict in ('Safe','Warning','Block')),
  findings jsonb not null default '[]'::jsonb,
  rules_version text not null,
  signature text not null,
  created_at timestamptz not null default now()
);

create table if not exists analysis_logs (
  id uuid primary key default gen_random_uuid(),
  wallet_pubkey text,
  verdict text not null,
  latency_ms integer,
  created_at timestamptz not null default now()
);

create table if not exists program_registry (
  program_id text primary key,
  label text not null,
  trust_level text not null default 'unknown',
  source text
);

create index if not exists idx_receipts_tx_hash on receipts (tx_hash);
create index if not exists idx_logs_created_at on analysis_logs (created_at desc);
