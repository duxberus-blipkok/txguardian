"use client"

import { useState } from "react"
import type { AnalysisResult } from "@/lib/types"
import VerdictBadge from "./VerdictBadge"

export default function AnalyzeForm() {
  const [tx, setTx] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionBase64: tx.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to analyze")
      setResult(json as AnalysisResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-3">
        <textarea
          value={tx}
          onChange={(e) => setTx(e.target.value)}
          placeholder="Paste a serialized transaction (base64)…"
          rows={5}
          className="w-full rounded-xl border border-line bg-surface p-3.5 font-mono text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading || !tx.trim()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
        >
          {loading ? "Analyzing…" : "Analyze transaction"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-block/40 bg-block/10 p-3 text-sm text-block">
          {error}
        </div>
      )}

      {result && (
        <section className="space-y-5 rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Result</h2>
            <VerdictBadge verdict={result.verdict} />
          </div>

          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
              Explanation
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {result.explanation}
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              Findings ({result.findings.length})
            </h3>
            <ul className="space-y-2">
              {result.findings.map((f) => (
                <li
                  key={f.code}
                  className="rounded-xl border border-line p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{f.title}</span>
                    <VerdictBadge verdict={f.severity} />
                  </div>
                  <code className="font-mono text-xs text-muted">{f.code}</code>
                </li>
              ))}
              {result.findings.length === 0 && (
                <li className="text-sm text-muted">No risky findings.</li>
              )}
            </ul>
          </div>

          <details className="text-xs text-muted">
            <summary className="cursor-pointer select-none">
              Signed risk receipt
            </summary>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-line bg-canvas p-3 font-mono">
              {JSON.stringify(result.receipt, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </div>
  )
}
