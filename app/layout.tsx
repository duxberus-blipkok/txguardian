import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "TxGuardian — Solana transaction safety",
  description:
    "Decode, simulate, and risk-score Solana transactions before you sign.",
}

// Prevent theme flash: set the class before paint based on stored/system pref.
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('txg-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored ? stored === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div className="mx-auto max-w-3xl px-5 py-10">{children}</div>
      </body>
    </html>
  )
}
