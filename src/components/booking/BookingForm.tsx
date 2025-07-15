'use client'

import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { Venue, TimeSlot } from '@/types/database'
import { useAuth } from '@/hooks/useAuth'
import { useBookings } from '@/hooks/useBookings'
import { usePayments } from '@/hooks/usePayments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PhoneInput from '@/components/ui/PhoneInput'
import { validatePhone10Digits } from '@/utils/validation'
import { LoadingSpinner } from '@/components/common/LoadingStates'

interface BookingFormProps {
  venue: Venue
  slot: TimeSlot
  onSuccess?: (bookingId: string) => void
  onConflict?: () => void
}

export default function BookingForm({ venue, slot, onSuccess, onConflict }: BookingFormProps) {
  const { user, authType } = useAuth()
  const { createBooking } = useBookings()
  const { initiatePayment, loading: paymentLoading, paymentMode, isPaymentEnabled } = usePayments()

  const [phone, setPhone] = useState<string>('')

  // Auto-fill phone when conditions are met
  useEffect(() => {
    if (authType === 'account' && user?.phone) {
      setPhone(user.phone)
    }
  }, [authType, user])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Prévenir les double-submit
    if (submitting) {
      console.log('🚫 Double-submit détecté - ignoré')
      return
    }

    // Validation du téléphone (10 chiffres exactement)
    const phoneDigits = phone.replace('+225', '')
    if (!validatePhone10Digits(phoneDigits)) {
      setError('Le numéro de téléphone doit contenir exactement 10 chiffres')
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

      // PAYMENT_DISABLED_MODE: Initier le paiement (Wave CI ou mock)
      if (isPaymentEnabled) {
        // Mode normal avec vraie API Wave CI
        const paymentResponse = await initiatePayment({
          booking_id: booking.id,
          provider: 'wave',
          amount: booking.total_amount,
          phone_number: phone,
        })

        if (paymentResponse?.checkout_url) {
          window.location.href = paymentResponse.checkout_url
        } else {
          onSuccess?.(booking.id)
        }
      } else {
        // Mode mock - Simuler le paiement
        console.log('🧪 Mode test activé - Simulation paiement...')
        
        const mockPaymentResponse = await initiatePayment({
          booking_id: booking.id,
          provider: 'wave',
          amount: booking.total_amount,
          phone_number: phone,
        })
        
        if (mockPaymentResponse?.mock) {
          // Simuler une confirmation automatique après délai
          console.log('✅ Paiement simulé terminé - Redirection vers succès')
          onSuccess?.(booking.id)
        }
      }
    } catch (err) {
      console.error('❌ Erreur lors de la réservation:', err)
      const errorMessage = (err as Error).message
      
      // Améliorer les messages d'erreur pour l'utilisateur
      let userFriendlyMessage = errorMessage
      
      if (errorMessage.includes('Créneau déjà réservé') || 
          errorMessage.includes('déjà réservé') || 
          errorMessage.includes('autre utilisateur')) {
        userFriendlyMessage = 'Ce créneau vient d\'être réservé par un autre utilisateur. Veuillez choisir un autre créneau.'
        console.log('🔄 Conflit détecté - Rafraîchissement des créneaux...')
        onConflict?.()
      } else if (errorMessage.includes('Créneau non disponible')) {
        userFriendlyMessage = 'Ce créneau n\'est plus disponible. Veuillez en sélectionner un autre.'
        onConflict?.()
      } else if (errorMessage.includes('Incohérence')) {
        userFriendlyMessage = 'Erreur de sélection. Veuillez recharger la page et réessayer.'
      } else if (errorMessage.includes('téléphone')) {
        userFriendlyMessage = 'Numéro de téléphone invalide. Veuillez vérifier le format.'
      } else if (errorMessage.includes('réseau') || errorMessage.includes('network')) {
        userFriendlyMessage = 'Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.'
      } else if (errorMessage.includes('timeout')) {
        userFriendlyMessage = 'La requête a pris trop de temps. Veuillez réessayer.'
      } else {
        userFriendlyMessage = 'Une erreur est survenue. Veuillez réessayer dans quelques instants.'
      }
      
      setError(userFriendlyMessage)
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* PAYMENT_DISABLED_MODE: Banner mode test */}
      {!isPaymentEnabled && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-md text-sm">
          <span className="font-medium">🧪 Mode Test</span> - Les paiements sont simulés
        </div>
      )}
      
      <div className="border p-4 rounded-md bg-gray-50 border-l-4 border-ci-green">
        <h3 className="font-semibold text-ci-green mb-2">Récapitulatif</h3>
        <p><strong>Terrain :</strong> {venue.name}</p>
        <p><strong>Date :</strong> {new Date(slot.start_time).toLocaleDateString('fr-FR')}</p>
        <p><strong>Heure :</strong> {new Date(slot.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
        <p><strong>Montant :</strong> <span className="text-ci-orange font-semibold">{Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(venue.price_per_hour)}</span></p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Téléphone pour confirmation <span className="text-red-500">*</span>
        </label>
        <PhoneInput
          value={phone}
          onChange={setPhone}
          placeholder="XXXXXXXXXX"
          disabled={authType === 'account' && !!user?.phone}
          required
        />
        {authType === 'account' && user?.phone && (
          <p className="text-sm text-gray-500 mt-1">
            Numéro pré-rempli depuis votre compte
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes (optionnel)</label>
        <Input value={notes} onChange={(e: ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)} placeholder="Ex: Ramener des balles" />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button type="submit" disabled={submitting || paymentLoading} variant="green" className="w-full flex items-center justify-center gap-2">
        {submitting || paymentLoading && <LoadingSpinner />}
        {submitting || paymentLoading ? 
          (paymentMode === 'mock' ? 'Simulation en cours…' : 'Réservation…') : 
          (isPaymentEnabled ? 'Réserver et payer avec Wave' : 'Réserver (Mode Test)')
        }
      </Button>
    </form>
  )
}