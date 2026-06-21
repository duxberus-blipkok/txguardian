import type { Verdict } from "@/lib/types"

const STYLES: Record<Verdict, string> = {
  Safe: "bg-safe/15 text-safe border-safe/40",
  Warning: "bg-warning/15 text-warning border-warning/40",
  Block: "bg-block/15 text-block border-block/40",
}

export default function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${STYLES[verdict]}`}
    >
      {verdict}
    </span>
  )
}
