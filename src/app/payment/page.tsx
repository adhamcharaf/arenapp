'use client'

export const dynamic = 'force-dynamic'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { usePaymentStatus } from '@/hooks/usePaymentStatus'
import { LoadingSpinner } from '@/components/common/LoadingStates'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PaymentStatusPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('booking') || undefined
  const router = useRouter()

  const { payment, loading, error } = usePaymentStatus(bookingId)

  useEffect(() => {
    if (payment?.status === 'completed') {
      // Redirect to profile or confirmation
      router.push('/profile')
    }
  }, [payment, router])

  return (
    <div className="container mx-auto px-4 py-16 text-center space-y-6">
      <h1 className="text-3xl font-bold">Paiement Wave CI</h1>

      {loading && (
        <div className="flex justify-center"><LoadingSpinner /></div>
      )}

      {error && <p className="text-red-600">Erreur: {error}</p>}

      {payment && (
        <div>
          <p className="text-lg">Statut: <strong>{payment.status}</strong></p>
          {payment.status === 'pending' && <p className="text-gray-600">En attente de confirmation du paiement mobile…</p>}
          {payment.status === 'failed' && <p className="text-red-600">Votre paiement a échoué, veuillez réessayer.</p>}
          {payment.status === 'completed' && <p className="text-green-600">Paiement réussi !</p>}
        </div>
      )}

      <div className="flex justify-center gap-4">
        <Link href="/profile"><Button variant="outline">Aller au profil</Button></Link>
        <Link href="/"><Button variant="outline">Retour à l'accueil</Button></Link>
      </div>
    </div>
  )
}