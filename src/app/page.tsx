import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-extrabold text-ci-green mb-4">Réservez votre terrain en quelques clics</h1>
          <p className="text-xl text-gray-700 mb-8">Padel ou football · Paiement mobile money Wave CI · 100% Côte d&apos;Ivoire</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/booking?sport=padel">
              <Button size="lg" variant="green" className="w-48">Padel</Button>
            </Link>
            <Link href="/booking?sport=football">
              <Button size="lg" variant="default" className="w-48">Football</Button>
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none select-none opacity-5 bg-[url('/ci-flag.svg')] bg-cover" />
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Pourquoi ARENAPP ?</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <h3 className="text-xl text-ci-orange font-semibold mb-2">Réservation instantanée</h3>
            <p className="text-gray-600">Disponibilité en temps réel des terrains d'ARENA.</p>
          </div>
          <div>
            <h3 className="text-xl text-ci-green font-semibold mb-2">Paiement sécurisé</h3>
            <p className="text-gray-600">Wave, Orange money et MTN money.</p>
          </div>
          <div>
            <h3 className="text-xl text-ci-orange font-semibold mb-2">100% Ivoirien</h3>
            <p className="text-gray-600">Conçu et hébergé en Côte d'Ivoire pour un service local optimal.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
