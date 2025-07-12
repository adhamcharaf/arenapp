'use client'

import { useEffect } from 'react'
import React from 'react'
import { LoadingSpinner } from '@/components/common/LoadingStates'

interface MockPaymentProps {
  amount: number
  onSuccess: () => void
}

export default function MockPayment({ amount, onSuccess }: MockPaymentProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onSuccess()
    }, 2500) // 2.5s for realistic delay
    return () => clearTimeout(timer)
  }, [onSuccess])

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center space-y-4">
        <h2 className="text-2xl font-bold text-ci-green">Mode Test</h2>
        <p className="text-ci-orange font-semibold">Paiements désactivés</p>
        <p className="text-gray-700">Montant simulé&nbsp;:
          <span className="ml-1 font-semibold text-ci-orange">
            {Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount)}
          </span>
        </p>
        <div className="flex justify-center"><LoadingSpinner /></div>
        <p className="text-sm text-gray-500">Réservation confirmée automatiquement…</p>
      </div>
    </div>
  )
}