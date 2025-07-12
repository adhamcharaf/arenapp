import { useState } from 'react'
import { PaymentProvider } from '@/types/database'

export function usePayments() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // @ts-ignore NEXT_PUBLIC env est injecté côté client par Next.js
  const PAYMENT_ENABLED = (process?.env?.NEXT_PUBLIC_PAYMENTS_ENABLED ?? 'true') !== 'false'

  const initiatePayment = async (paymentData: {
    booking_id: string
    provider: PaymentProvider
    amount: number
    phone_number: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      if (!PAYMENT_ENABLED) {
        // PAYMENT_DISABLED: simulation immédiate
        await new Promise((res) => setTimeout(res, 2500))
        return {
          success: true,
          message: 'Paiement simulé (mode test)',
          payment_url: null,
          mode: 'mock'
        } as any
      }

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

      if (!PAYMENT_ENABLED) {
        // PAYMENT_DISABLED: retourne statut complété directement
        await new Promise((res) => setTimeout(res, 500))
        return { status: 'completed', mode: 'mock' } as any
      }

      const endpoint = getPaymentEndpoint(provider)
      
      const response = await fetch(`${endpoint}?session_id=${sessionId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de vérification de paiement')
      }

      return data
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
    checkPaymentStatus
  }
}