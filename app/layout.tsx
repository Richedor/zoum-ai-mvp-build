import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "ZoumAI - Boîtier Intelligent pour la Sécurité des Flottes",
  description:
    "Sécurisez vos trajets, sauvez des vies et révolutionnez la gestion de vos flottes en Afrique avec ZoumAI",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Providers>
              {children}
              <Toaster />
            </Providers>
          </Suspense>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
