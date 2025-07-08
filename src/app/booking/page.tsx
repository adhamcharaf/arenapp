'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useVenues } from '@/hooks/useVenues'
import VenueCard from '@/components/booking/VenueCard'
import TimeSlotPicker from '@/components/booking/TimeSlotPicker'
import BookingForm from '@/components/booking/BookingForm'
import { SportType, Venue, TimeSlot } from '@/types/database'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function BookingPage() {
  const searchParams = useSearchParams()
  const sportParam = searchParams.get('sport') as SportType | null
  const router = useRouter()

  const { venues, loading, error } = useVenues(sportParam || undefined)

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

  const handleBookingSuccess = (bookingId: string) => {
    router.push(`/payment?booking=${bookingId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Réservation</h1>
        <Link href="/">
          <Button variant="outline" size="sm">← Retour</Button>
        </Link>
      </div>

      {/* Step 1: Sélection terrain */}
      {!selectedVenue && (
        <>
          {loading && <p className="text-center">Chargement des terrains…</p>}
          {error && <p className="text-center text-red-600">Erreur: {error}</p>}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue: Venue) => (
              <VenueCard key={venue.id} venue={venue} onSelect={setSelectedVenue} />
            ))}
          </div>
          {!loading && venues.length === 0 && (
            <p className="text-center text-gray-600">Aucun terrain disponible.</p>
          )}
        </>
      )}

      {/* Step 2: Sélection créneau */}
      {selectedVenue && !selectedSlot && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedVenue(null)}>← Changer de terrain</Button>
            <h2 className="text-2xl font-semibold">Choisissez un créneau pour {selectedVenue.name}</h2>
          </div>
          <TimeSlotPicker venueId={selectedVenue.id} onSelect={setSelectedSlot} />
        </div>
      )}

      {/* Step 3: Formulaire réservation + paiement */}
      {selectedVenue && selectedSlot && (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => setSelectedSlot(null)}>← Changer de créneau</Button>
          <BookingForm venue={selectedVenue} slot={selectedSlot} onSuccess={handleBookingSuccess} />
        </div>
      )}
    </div>
  )
}