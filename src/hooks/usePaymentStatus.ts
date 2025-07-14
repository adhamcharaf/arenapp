import { useEffect, useState } from 'react'
import { Payment } from '@/types/database'

export function usePaymentStatus(bookingId?: string, intervalMs = 5000) {
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bookingId) return

    let intervalId: NodeJS.Timeout

    const fetchStatus = async () => {
      try {
        console.log('🔍 Récupération statut paiement via API pour booking:', bookingId)
        
        const response = await fetch(`/api/payments/status?booking_id=${bookingId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erreur récupération paiement')
        }

        if (data.success) {
          setPayment(data.payment)
          setError(null)
          console.log('✅ Statut paiement récupéré:', data.payment?.status || 'aucun paiement')
        } else {
          throw new Error(data.error || 'Erreur inconnue')
        }
      } catch (err) {
        console.error('❌ Erreur usePaymentStatus:', err)
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    intervalId = setInterval(fetchStatus, intervalMs)

    return () => clearInterval(intervalId)
  }, [bookingId, intervalMs])

  return { payment, loading, error }
}