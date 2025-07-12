import { useState } from 'react'
import { PaymentProvider } from '@/types/database'
import { PAYMENT_ENABLED } from '@/utils/constants'

export function usePayments() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initiatePayment = async (paymentData: {
    booking_id: string
    provider: PaymentProvider
    amount: number
    phone_number: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      // PAYMENT_DISABLED: Mode mock pour les tests
      if (!PAYMENT_ENABLED) {
        return {
          success: true,
          mock_mode: true,
          payment_id: `mock_${Date.now()}`,
          booking_id: paymentData.booking_id,
          message: 'Mode test - Paiement simulé'
        }
      }

      // PAYMENT_DISABLED: Code Wave CI original (temporairement désactivé)
      /*
      const endpoint = getPaymentEndpoint(paymentData.provider)
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de paiement')
      }

      return data
      */

      // Fallback pour le mode désactivé
      throw new Error('Paiements temporairement désactivés')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async (
    provider: PaymentProvider,
    sessionId: string
  ) => {
    try {
      setLoading(true)
      setError(null)

      // PAYMENT_DISABLED: Mode mock pour les tests
      if (!PAYMENT_ENABLED) {
        return {
          success: true,
          status: 'completed',
          mock_mode: true,
          message: 'Mode test - Statut simulé'
        }
      }

      // PAYMENT_DISABLED: Code Wave CI original (temporairement désactivé)
      /*
      const endpoint = getPaymentEndpoint(provider)
      
      const response = await fetch(`${endpoint}?session_id=${sessionId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de vérification de paiement')
      }

      return data
      */

      // Fallback pour le mode désactivé
      throw new Error('Vérification de paiement temporairement désactivée')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getPaymentEndpoint = (provider: PaymentProvider): string => {
    switch (provider) {
      case 'wave':
        return '/api/payments/wave'
      case 'orange':
        return '/api/payments/orange'
      case 'mtn':
        return '/api/payments/mtn'
      default:
        throw new Error(`Provider ${provider} non supporté`)
    }
  }

  return {
    loading,
    error,
    initiatePayment,
    checkPaymentStatus,
    isPaymentEnabled: PAYMENT_ENABLED
  }
}