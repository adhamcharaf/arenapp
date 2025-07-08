'use client'

import { useSearchParams } from 'next/navigation'
import { useVenues } from '@/hooks/useVenues'
import VenueCard from '@/components/booking/VenueCard'
import { SportType } from '@/types/database'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function BookingPage() {
  const searchParams = useSearchParams()
  const sportParam = searchParams.get('sport') as SportType | null

  const { venues, loading, error } = useVenues(sportParam || undefined)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Sélection du terrain</h1>
        <Link href="/">
          <Button variant="outline" size="sm">← Retour</Button>
        </Link>
      </div>

      {loading && <p className="text-center">Chargement...</p>}
      {error && <p className="text-center text-red-600">Erreur: {error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} onSelect={() => {/* TODO: navigate to time slot picker */}} />
        ))}
      </div>

      {!loading && venues.length === 0 && (
        <p className="text-center text-gray-600 mt-12">Aucun terrain disponible pour le moment.</p>
      )}
    </div>
  )
}