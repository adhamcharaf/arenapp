'use client'

import { useState } from 'react'
import { Booking, BookingStatus } from '@/types/database'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common/LoadingStates'

interface BookingHistoryProps {
  bookings: Booking[]
  onCancelBooking: (id: string) => Promise<void>
  loading?: boolean
}

export default function BookingHistory({ bookings, onCancelBooking, loading }: BookingHistoryProps) {
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  // Filtrer les réservations
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filter)

  // Trier par date décroissante
  const sortedBookings = [...filteredBookings].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const handleCancel = async (bookingId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      setCancellingId(bookingId)
      try {
        await onCancelBooking(bookingId)
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error)
      } finally {
        setCancellingId(null)
      }
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getStatusBadge = (status: BookingStatus) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmée' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Terminée' },
      no_show: { bg: 'bg-red-100', text: 'text-red-800', label: 'Absence' }
    }
    const badge = badges[status]
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  const filters = [
    { value: 'all', label: 'Tous', count: bookings.length },
    { value: 'confirmed', label: 'Confirmées', count: bookings.filter(b => b.status === 'confirmed').length },
    { value: 'cancelled', label: 'Annulées', count: bookings.filter(b => b.status === 'cancelled').length },
    { value: 'completed', label: 'Terminées', count: bookings.filter(b => b.status === 'completed').length }
  ]

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-16">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">Historique des réservations</h2>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as BookingStatus | 'all')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter === f.value
                  ? 'bg-ci-orange text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Liste des réservations */}
        {sortedBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? 'Aucune réservation pour le moment' 
                : `Aucune réservation ${filters.find(f => f.value === filter)?.label.toLowerCase()}`}
            </p>
            {filter === 'all' && (
              <Button variant="green">
                Faire une réservation
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedBookings.map(booking => {
              const { date, time } = formatDateTime(booking.time_slot?.start_time || booking.created_at)
              const canCancel = (booking.status === 'pending' || booking.status === 'confirmed')
              
              return (
                <div key={booking.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {booking.venue?.name || 'Terrain'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {booking.venue?.sport_type === 'padel' ? 'Padel' : 'Football'}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Date:</span>{' '}
                      <span className="font-medium">{date}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Heure:</span>{' '}
                      <span className="font-medium">{time}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Montant:</span>{' '}
                      <span className="font-medium text-ci-orange">
                        {booking.total_amount.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tél:</span>{' '}
                      <span className="font-medium">{booking.phone_number}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {canCancel && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                      >
                        {cancellingId === booking.id ? (
                          <>
                            <LoadingSpinner />
                            <span className="ml-2">Annulation...</span>
                          </>
                        ) : (
                          'Annuler'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}