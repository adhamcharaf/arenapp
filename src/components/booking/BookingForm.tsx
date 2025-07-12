'use client'

import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { Venue, TimeSlot } from '@/types/database'
import { useAuth } from '@/hooks/useAuth'
import { useBookings } from '@/hooks/useBookings'
import { usePayments } from '@/hooks/usePayments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PHONE_REGEX } from '@/utils/constants'
import { LoadingSpinner } from '@/components/common/LoadingStates'
import MockPayment from '@/components/common/MockPayment'

interface BookingFormProps {
  venue: Venue
  slot: TimeSlot
  onSuccess?: (bookingId: string) => void
}

export default function BookingForm({ venue, slot, onSuccess }: BookingFormProps) {
  const { user, authType } = useAuth()
  const { createBooking } = useBookings()
  const { initiatePayment, loading: paymentLoading, isPaymentEnabled } = usePayments()

  const [phone, setPhone] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMockPayment, setShowMockPayment] = useState(false)
  const [currentBooking, setCurrentBooking] = useState<any>(null)

  // Auto-fill phone when conditions are met
  useEffect(() => {
    if (authType === 'account' && user?.phone) {
      setPhone(user.phone)
    }
  }, [authType, user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!PHONE_REGEX.test(phone)) {
      setError('Numéro de téléphone invalide')
      return
    }

    setSubmitting(true)
    console.log('🚀 Début soumission formulaire réservation')
    try {
      // Créer la réservation
      console.log('📝 Données à envoyer:', {
        venue_id: venue.id,
        time_slot_id: slot.id,
        phone_number: phone,
        notes: notes || undefined,
      })
      
      const booking = await createBooking({
        venue_id: venue.id,
        time_slot_id: slot.id,
        phone_number: phone,
        notes: notes || undefined,
      })
      
      console.log('✅ Réservation créée côté client:', booking)

      // PAYMENT_DISABLED: Mode mock pour les tests
      if (!isPaymentEnabled) {
        setCurrentBooking({
          id: booking.id,
          venue_name: venue.name,
          total_amount: booking.total_amount,
          phone_number: phone
        })
        setShowMockPayment(true)
        setSubmitting(false)
        return
      }

      // PAYMENT_DISABLED: Code Wave CI original (temporairement désactivé)
      /*
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
      */

      // Fallback temporaire
      setError('Paiements temporairement désactivés')
    } catch (err) {
      console.error('❌ Erreur lors de la réservation:', err)
      setError((err as Error).message)
    }
    setSubmitting(false)
  }

  const handleMockPaymentSuccess = async (bookingId: string) => {
    // Confirmer la réservation via l'API mock
    try {
      const response = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ booking_id: bookingId })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la confirmation')
      }
      
      console.log('✅ Réservation confirmée automatiquement:', data)
      onSuccess?.(bookingId)
    } catch (err) {
      console.error('❌ Erreur lors de la confirmation mock:', err)
      setError('Erreur lors de la validation de la réservation')
    }
    setShowMockPayment(false)
    setCurrentBooking(null)
  }

  const handleMockPaymentCancel = () => {
    setShowMockPayment(false)
    setCurrentBooking(null)
  }

  return (
    <>
      {/* Banner Mode Test */}
      {!isPaymentEnabled && (
        <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-orange-800">
              Mode Test - Paiements Désactivés
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border p-4 rounded-md bg-gray-50 border-l-4 border-ci-green">
        <h3 className="font-semibold text-ci-green mb-2">Récapitulatif</h3>
        <p><strong>Terrain :</strong> {venue.name}</p>
        <p><strong>Date :</strong> {new Date(slot.start_time).toLocaleDateString('fr-FR')}</p>
        <p><strong>Heure :</strong> {new Date(slot.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
        <p><strong>Montant :</strong> <span className="text-ci-orange font-semibold">{Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(venue.price_per_hour)}</span></p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Téléphone pour confirmation</label>
        <Input
          type="tel"
          value={phone}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
          placeholder="+225XXXXXXXX"
          disabled={authType === 'account' && !!user?.phone}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes (optionnel)</label>
        <Input value={notes} onChange={(e: ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)} placeholder="Ex: Ramener des balles" />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button type="submit" disabled={submitting || paymentLoading} variant="green" className="w-full flex items-center justify-center gap-2">
        {submitting || paymentLoading && <LoadingSpinner />}
        {submitting || paymentLoading ? 'Réservation…' : !isPaymentEnabled ? 'Réserver (Mode Test)' : 'Réserver et payer avec Wave'}
      </Button>
    </form>

    {/* Modal MockPayment */}
    {showMockPayment && currentBooking && (
      <MockPayment
        booking={currentBooking}
        onSuccess={handleMockPaymentSuccess}
        onCancel={handleMockPaymentCancel}
      />
    )}
  </>
  )
}