'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import LoginForm, { type LoginData } from '@/components/auth/LoginForm'
import RegisterForm, { type RegisterData } from '@/components/auth/RegisterForm'

type AuthMode = 'login' | 'register'

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  
  const { registerComplete, loginDual, loading, user, authType } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [error, setError] = useState<string | null>(null)


  const handleLogin = async (data: LoginData) => {
    setError(null)
    try {
      console.log('🔐 Début connexion...')
      
      const result = await loginDual(data)
      console.log('🎯 Résultat loginDual:', result)
      
      if (result.authType === 'account') {
        console.log('🚀 Connexion réussie, redirection avec refresh...')
        // ✅ SOLUTION SIMPLE ET FIABLE : window.location.href
        window.location.href = redirectTo
      } else if (result.authType === 'guest') {
        console.log('👤 Connexion invité, navigation directe')
        router.push(redirectTo)
      }
    } catch (err) {
      console.error('❌ Erreur connexion:', err)
      setError((err as Error).message)
    }
  }

  const handleRegister = async (data: RegisterData) => {
    setError(null)
    try {
      const result = await registerComplete(data)
      
      // Pour l'inscription, afficher un message de confirmation
      if (result && !result.session) {
        setError('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.')
        return
      }
      
      // Si une session est créée (connexion immédiate), rediriger
      if (result && result.session) {
        window.location.href = redirectTo
      }
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ci-green/10 to-ci-orange/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-ci-green mb-2">ARENAPP</h1>
          <p className="text-gray-600">Réservation sportive en Côte d'Ivoire</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError(null)
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'bg-white text-ci-green shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setError(null)
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'register'
                ? 'bg-white text-ci-green shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Inscription
          </button>
        </div>

        {/* Forms */}
        {mode === 'login' ? (
          <LoginForm
            onSubmit={handleLogin}
            loading={loading}
            error={error}
          />
        ) : (
          <RegisterForm
            onSubmit={handleRegister}
            loading={loading}
            error={error}
          />
        )}

        {/* Continue as guest */}
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            onClick={() => router.push(redirectTo)}
          >
            Continuer comme invité
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-ci-green/10 to-ci-orange/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="animate-pulse">Chargement...</div>
      </Card>
    </div>}>
      <AuthPageContent />
    </Suspense>
  )
}