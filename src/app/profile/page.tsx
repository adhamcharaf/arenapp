'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useBookings } from '@/hooks/useBookings'
import { LoadingSpinner } from '@/components/common/LoadingStates'
import ProfileInfo from '@/components/profile/ProfileInfo'
import ProfileStats from '@/components/profile/ProfileStats'
import BookingHistory from '@/components/profile/BookingHistory'
import AccountSettings from '@/components/profile/AccountSettings'

export default function ProfilePage() {
  const router = useRouter()
  const { user, session, loading: authLoading, authType, signOut } = useAuth()
  const { bookings, loading: bookingsLoading, cancelBooking, refreshBookings } = useBookings(user?.id)

  useEffect(() => {
    // Protection de route - Rediriger si non connecté
    if (!authLoading && !user && !session) {
      router.push('/auth/login')
    }
  }, [authLoading, user, session, router])

  // Loading state général
  if (authLoading || bookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    )
  }

  // Vérification supplémentaire
  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="bg-ci-green rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Mon Profil</h1>
        <p className="text-white/90">
          Gérez vos informations et consultez votre historique de réservations
        </p>
      </div>

      {/* Layout principal */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Colonne gauche - Infos et stats */}
        <div className="md:col-span-1 space-y-6">
          <ProfileInfo user={user} loading={authLoading} />
          <ProfileStats bookings={bookings} />
        </div>

        {/* Colonne droite - Historique */}
        <div className="md:col-span-2">
          <BookingHistory
            bookings={bookings}
            onCancelBooking={cancelBooking}
            loading={bookingsLoading}
          />
        </div>
      </div>

      {/* Paramètres du compte */}
      <div className="mt-6">
        <AccountSettings
          user={user}
          onSignOut={signOut}
        />
      </div>
    </div>
  )
}