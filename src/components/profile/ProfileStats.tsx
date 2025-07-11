'use client'

import { Booking } from '@/types/database'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface ProfileStatsProps {
  bookings: Booking[]
}

export default function ProfileStats({ bookings }: ProfileStatsProps) {
  // Calculer les statistiques
  const totalBookings = bookings.length
  
  const totalAmount = bookings.reduce((sum, booking) => {
    return sum + (booking.total_amount || 0)
  }, 0)

  // Compter les réservations par sport
  const sportCounts = bookings.reduce((acc, booking) => {
    if (booking.venue?.sport_type) {
      acc[booking.venue.sport_type] = (acc[booking.venue.sport_type] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const mostPlayedSport = Object.entries(sportCounts).sort(([,a], [,b]) => b - a)[0]

  // Réservations ce mois-ci
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)
  
  const bookingsThisMonth = bookings.filter(booking => {
    const bookingDate = new Date(booking.created_at)
    return bookingDate >= thisMonth
  }).length

  const stats = [
    {
      label: 'Total réservations',
      value: totalBookings.toString(),
      icon: '📊',
      color: 'text-ci-green'
    },
    {
      label: 'Montant total',
      value: `${totalAmount.toLocaleString('fr-FR')} FCFA`,
      icon: '💰',
      color: 'text-ci-orange'
    },
    {
      label: 'Sport préféré',
      value: mostPlayedSport ? 
        (mostPlayedSport[0] === 'padel' ? 'Padel' : 'Football') : 
        'Aucun',
      icon: '⚽',
      color: 'text-blue-600'
    },
    {
      label: 'Ce mois-ci',
      value: bookingsThisMonth.toString(),
      icon: '📅',
      color: 'text-purple-600'
    }
  ]

  return (
    <Card>
      <CardHeader className="bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">Mes statistiques</h2>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}