'use client'

import { useState } from 'react'
import { Venue, TimeSlot } from '@/types/database'
import { useAuth } from '@/hooks/useAuth'
import { useBookings } from '@/hooks/useBookings'
import { usePayments } from '@/hooks/usePayments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PHONE_REGEX } from '@/utils/constants'
import { LoadingSpinner } from '@/components/common/LoadingStates'

interface BookingFormProps {
  venue: Venue
  slot: TimeSlot
  onSuccess?: (bookingId: string) => void
}

export default function BookingForm({ venue, slot, onSuccess }: BookingFormProps) {
  const { user, authType } = useAuth()
  const { createBooking } = useBookings()
  const { initiatePayment, loading: paymentLoading } = usePayments()

  const [phone, setPhone] = useState(user?.phone || '')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!PHONE_REGEX.test(phone)) {
      setError('Numéro de téléphone invalide')
      return
    }

    setSubmitting(true)
    try {
      // Créer la réservation
      const booking = await createBooking({
        venue_id: venue.id,
        time_slot_id: slot.id,
        phone_number: phone,
        notes: notes || undefined,
      })

      // Initier le paiement Wave CI
      const paymentResponse = await initiatePayment({
        booking_id: booking.id,
        provider: 'wave',
        amount: booking.total_amount,
        phone_number: phone,
      })

      if (paymentResponse?.payment_url) {
        window.location.href = paymentResponse.payment_url
      } else {
        onSuccess?.(booking.id)
      }
    } catch (err) {
      setError((err as Error).message)
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border p-4 rounded-md bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-2">Récapitulatif</h3>
        <p><strong>Terrain :</strong> {venue.name}</p>
        <p><strong>Date :</strong> {new Date(slot.start_time).toLocaleDateString('fr-FR')}</p>
        <p><strong>Heure :</strong> {new Date(slot.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
        <p><strong>Montant :</strong> {Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(venue.price_per_hour)}</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Téléphone pour confirmation</label>
        <Input type="tel" value={phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes (optionnel)</label>
        <Input value={notes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)} placeholder="Ex: Ramener des balles" />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button type="submit" disabled={submitting || paymentLoading} className="w-full flex items-center justify-center gap-2">
        {submitting || paymentLoading && <LoadingSpinner />}
        {submitting || paymentLoading ? 'Réservation…' : 'Réserver et payer avec Wave'}
      </Button>
    </form>
  )
}