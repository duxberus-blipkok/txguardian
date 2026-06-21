import AnalyzeForm from "@/components/AnalyzeForm"
import ThemeToggle from "@/components/ThemeToggle"

export default function Home() {
  return (
    <main className="space-y-10">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            TxGuardian
          </h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-muted">
            Paste a serialized transaction (base64). We decode it, simulate the
            account changes, and return a{" "}
            <span className="text-safe">Safe</span> /{" "}
            <span className="text-warning">Warning</span> /{" "}
            <span className="text-block">Block</span> verdict. The decision to
            sign always stays with you.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <AnalyzeForm />

      <footer className="border-t border-line pt-6 text-xs text-muted">
        A guardrail, not a guarantee. Always verify before you sign.
      </footer>
    </main>
  )
}
