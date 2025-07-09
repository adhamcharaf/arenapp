import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/padel-banner.webp"
            alt="Terrain de padel"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="container mx-auto px-4 py-16 text-center relative z-10">
          <h1 className="text-5xl font-extrabold text-white mb-4">Réservez votre terrain en quelques clics</h1>
          <p className="text-xl text-white/90 mb-8">Padel ou football · Paiement mobile money Wave CI · 100% Côte d&apos;Ivoire</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/booking?sport=padel">
              <Button size="lg" variant="green" className="w-48">Padel</Button>
            </Link>
            <Link href="/booking?sport=football">
              <Button size="lg" variant="default" className="w-48">Football</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Choisissez votre sport</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="relative overflow-hidden rounded-lg group cursor-pointer">
            <div className="aspect-video relative">
              <Image
                src="/football1.jpg"
                alt="Terrain de football"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <h3 className="text-3xl font-bold text-white mb-4">Football</h3>
                <p className="text-white/90 mb-6">Terrains de football en herbe synthétique</p>
                <Link href="/booking?sport=football">
                  <Button size="lg" variant="default" className="w-40">Réserver</Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg group cursor-pointer">
            <div className="aspect-video relative">
              <Image
                src="/padel-banner.webp"
                alt="Terrain de padel"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <h3 className="text-3xl font-bold text-white mb-4">Padel</h3>
                <p className="text-white/90 mb-6">Terrains de padel couverts et éclairés</p>
                <Link href="/booking?sport=padel">
                  <Button size="lg" variant="green" className="w-40">Réserver</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
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
