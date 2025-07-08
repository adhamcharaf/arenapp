import TestConnection from '@/components/TestConnection'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏟️ ARENAPP
          </h1>
          <p className="text-xl text-gray-600">
            Système de Réservation Sportive - Côte d'Ivoire
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Next.js 15 + TypeScript + Supabase + Wave CI
          </p>
        </header>
        
        <TestConnection />
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <div className="space-y-2">
            <p>ARENAPP - Phase 1 Infrastructure Complète</p>
            <div className="flex justify-center space-x-4">
              <span>✅ Auth Dual (Email/Téléphone)</span>
              <span>✅ Paiement Mobile Money</span>
              <span>✅ RLS Sécurisé</span>
              <span>✅ API Wave CI</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
