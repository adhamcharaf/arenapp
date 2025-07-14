import { useState } from 'react'
import { PaymentProvider, PaymentMode, MockPaymentResponse } from '@/types/database'

export function usePayments() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Vérifier si le mode paiement est activé
  const isPaymentEnabled = process.env.PAYMENT_ENABLED === 'true'
  const paymentMode: PaymentMode = isPaymentEnabled ? 'live' : 'mock'

  const initiatePayment = async (paymentData: {
    booking_id: string
    provider: PaymentProvider
    amount: number
    phone_number: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      // PAYMENT_DISABLED_MODE: Mode mock pour les tests
      if (paymentMode === 'mock') {
        console.log('🧪 Mode mock activé - Simulation paiement en cours...')
        
        // Créer une vraie entrée de paiement en base pour éviter l'erreur 406
        const mockPaymentData = {
          booking_id: paymentData.booking_id,
          provider: paymentData.provider,
          amount: paymentData.amount,
          phone_number: paymentData.phone_number,
          status: 'completed' as const,
          external_ref: `mock-session-${Date.now()}`,
          transaction_id: `mock-tx-${Date.now()}`
        }
        
        // Appeler l'API pour créer le paiement mock
        const response = await fetch('/api/payments/mock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mockPaymentData)
        })
        
        if (!response.ok) {
          // Fallback: simuler sans base de données
          console.log('⚠️ Impossible de créer le paiement mock en base, simulation simple')
          await new Promise(resolve => setTimeout(resolve, 2500))
          
          const mockResponse: MockPaymentResponse = {
            success: true,
            payment_id: `mock-payment-${Date.now()}`,
            session_id: `mock-session-${Date.now()}`,
            message: 'Paiement simulé avec succès (Mode Test)',
            mock: true
          }
          
          console.log('✅ Paiement mock terminé:', mockResponse)
          return mockResponse
        }
        
        // Simuler un délai réaliste
        await new Promise(resolve => setTimeout(resolve, 2500))
        
        const mockData = await response.json()
        console.log('✅ Paiement mock créé en base:', mockData)
        return mockData
      }

      // Mode normal avec vraie API Wave CI
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

      // PAYMENT_DISABLED_MODE: Mode mock pour les tests
      if (paymentMode === 'mock' && sessionId.startsWith('mock-session-')) {
        console.log('🧪 Mode mock - Vérification statut paiement simulé')
        
        // Simuler un délai
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        return {
          success: true,
          status: 'completed',
          payment: {
            id: sessionId.replace('session', 'payment'),
            status: 'completed',
            mock: true
          },
          transaction_id: `mock-tx-${Date.now()}`
        }
      }

      // Mode normal avec vraie API
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
    checkPaymentStatus,
    paymentMode,
    isPaymentEnabled
  }
}