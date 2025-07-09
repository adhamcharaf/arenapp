import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('booking_id', bookingId)
          .single()

        if (error) {
          setError(error.message)
        } else {
          setPayment(data as Payment)
        }
      } catch (err) {
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