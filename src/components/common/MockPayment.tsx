'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common/LoadingStates'
import { MOCK_PAYMENT_DELAY, CI_COLORS } from '@/utils/constants'

interface MockPaymentProps {
  booking: {
    id: string
    venue_name: string
    total_amount: number
    phone_number: string
  }
  onSuccess: (booking_id: string) => void
  onCancel: () => void
}

export default function MockPayment({ booking, onSuccess, onCancel }: MockPaymentProps) {
  const [step, setStep] = useState<'init' | 'processing' | 'success'>('init')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (step === 'processing') {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setStep('success')
            return 100
          }
          return prev + 10
        })
      }, MOCK_PAYMENT_DELAY / 10)
    }
    
    return () => clearInterval(interval)
  }, [step])

  useEffect(() => {
    if (step === 'success') {
      // Simuler un petit délai avant la redirection
      const timer = setTimeout(() => {
        onSuccess(booking.id)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [step, booking.id, onSuccess])

  const handleStartPayment = () => {
    setStep('processing')
    setProgress(0)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Banner Mode Test */}
        <div className="mb-6 p-3 bg-orange-100 border border-orange-300 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-orange-800">
              Mode Test - Paiements Désactivés
            </p>
          </div>
        </div>

        {step === 'init' && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-ci-green rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Paiement Wave CI (Simulation)
              </h3>
              <p className="text-sm text-gray-600">
                Réservation pour <strong>{booking.venue_name}</strong>
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">Montant</span>
                <span className="font-semibold text-ci-green">
                  {Intl.NumberFormat('fr-FR', { 
                    style: 'currency', 
                    currency: 'XOF' 
                  }).format(booking.total_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">Téléphone</span>
                <span className="font-medium">{booking.phone_number}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Mode</span>
                <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  Test - Validation automatique
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={onCancel}
                variant="outline"
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleStartPayment}
                className="flex-1"
                style={{ backgroundColor: CI_COLORS.green }}
              >
                Valider le paiement
              </Button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-ci-green rounded-full flex items-center justify-center mx-auto mb-4">
              <LoadingSpinner />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Traitement du paiement...
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Simulation du processus Wave CI
            </p>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-ci-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-500">
              Veuillez patienter pendant la validation...
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-ci-green rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ci-green mb-2">
              Paiement validé !
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Votre réservation a été confirmée automatiquement
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-ci-green rounded-full animate-pulse"></div>
              Redirection en cours...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}