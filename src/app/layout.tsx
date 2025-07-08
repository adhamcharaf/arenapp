import type { Metadata } from "next"
import "./globals.css"
import { Header } from "@/components/common/Header"
import { Footer } from "@/components/common/Footer"

export const metadata: Metadata = {
  title: "ARENAPP - Réservation de terrains sportifs en Côte d'Ivoire",
  description: "Réservez facilement vos créneaux de padel et football en ligne. Paiement sécurisé via Wave Money.",
  keywords: "padel, football, réservation, terrain, sport, Côte d'Ivoire, Abidjan, Wave",
  authors: [{ name: "ARENAPP" }],
  openGraph: {
    title: "ARENAPP - Réservation de terrains sportifs",
    description: "La plateforme #1 de réservation de terrains sportifs en Côte d'Ivoire",
    locale: "fr_CI",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
