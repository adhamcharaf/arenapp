'use client'

export const dynamic = 'force-dynamic'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import { useVenues } from '@/hooks/useVenues'
import VenueCard from '@/components/booking/VenueCard'
import TimeSlotPicker from '@/components/booking/TimeSlotPicker'
import BookingForm from '@/components/booking/BookingForm'
import { SportType, Venue, TimeSlot } from '@/types/database'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { LoadingSpinner } from '@/components/common/LoadingStates'

function BookingClient() {
  const searchParams = useSearchParams()
  const sportParam = searchParams.get('sport') as SportType | null
  const router = useRouter()

  const { venues, loading, error } = useVenues(sportParam || undefined)

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [shouldRefreshSlots, setShouldRefreshSlots] = useState(false)

  const handleBookingSuccess = (bookingId: string) => {
    router.push(`/payment?booking=${bookingId}`)
  }

  const handleBookingConflict = () => {
    // Reset selected slot and trigger refresh when conflict occurs
    setSelectedSlot(null)
    setShouldRefreshSlots(true)
  }

  const handleRefreshComplete = () => {
    setShouldRefreshSlots(false)
  }

  const getBackgroundImage = () => {
    if (sportParam === 'football') return '/football2.jpeg'
    if (sportParam === 'padel') return '/padel-banner.webp'
    return '/padel-banner.webp'
  }

  const getSportTitle = () => {
    if (sportParam === 'football') return 'Football'
    if (sportParam === 'padel') return 'Padel'
    return 'Réservation'
  }

  return (
    <div className="bg-white">
      <div className="relative h-64 flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src={getBackgroundImage()}
            alt={`Terrain de ${getSportTitle()}`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl font-bold mb-2">Réservation {getSportTitle()}</h1>
          <p className="text-white/90">Choisissez votre terrain et créneau</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="outline" size="sm">← Retour à l'accueil</Button>
          </Link>
        </div>

      {/* Step 1: Sélection terrain */}
      {!selectedVenue && (
        <>
          {loading && <div className="flex justify-center"><LoadingSpinner /></div>}
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
            <h2 className="text-2xl font-semibold text-ci-orange">Choisissez un créneau pour {selectedVenue.name}</h2>
          </div>
          <TimeSlotPicker 
            venueId={selectedVenue.id} 
            onSelect={setSelectedSlot} 
            shouldRefresh={shouldRefreshSlots}
            onRefreshComplete={handleRefreshComplete}
          />
        </div>
      )}

      {/* Step 3: Formulaire réservation + paiement */}
      {selectedVenue && selectedSlot && (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => setSelectedSlot(null)}>← Changer de créneau</Button>
          <BookingForm 
            venue={selectedVenue} 
            slot={selectedSlot} 
            onSuccess={handleBookingSuccess}
            onConflict={handleBookingConflict}
          />
        </div>
      )}
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><LoadingSpinner /></div>}>
      <BookingClient />
    </Suspense>
  )
}