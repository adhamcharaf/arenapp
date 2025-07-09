'use client'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12 text-center py-6 text-sm text-gray-600">
      <p>
        © {new Date().getFullYear()} ARENAPP · Abidjan, Côte d&apos;Ivoire
      </p>
      <p className="mt-1">Réservation sportive & paiement mobile money Wave CI</p>
    </footer>
  )
}