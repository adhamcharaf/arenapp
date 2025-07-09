import { useState, useEffect, useCallback } from 'react'
import { Booking } from '@/types/database'

export function useBookings(userId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)

      const response = await fetch(`/api/bookings?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de récupération des réservations')
      }

      setBookings(data.bookings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const createBooking = async (bookingData: {
    venue_id: string
    time_slot_id: string
    phone_number: string
    notes?: string
  }) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de création de réservation')
      }

      // Rafraîchir la liste
      await fetchBookings()
      
      return data.booking
    } catch (err) {
      throw err
    }
  }

  const updateBooking = async (id: string, updates: {
    status?: string
    notes?: string
  }) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, ...updates })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de mise à jour de réservation')
      }

      // Rafraîchir la liste
      await fetchBookings()
      
      return data.booking
    } catch (err) {
      throw err
    }
  }

  const cancelBooking = async (id: string) => {
    return updateBooking(id, { status: 'cancelled' })
  }

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBooking,
    cancelBooking,
    refreshBookings: fetchBookings
  }
}