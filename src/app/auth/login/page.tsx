'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { validateEmail } from '@/utils/validation'
import { PHONE_REGEX } from '@/utils/constants'
import { LoadingSpinner } from '@/components/common/LoadingStates'

type AuthMode = 'login' | 'register'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  
  const { login, register, loading } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validations
    if (!email && !phone) {
      setError('Email ou téléphone requis')
      return
    }

    if (email && !validateEmail(email)) {
      setError('Format email invalide')
      return
    }

    if (phone && !PHONE_REGEX.test(phone)) {
      setError('Format téléphone invalide')
      return
    }

    if (password.length < 8) {
      setError('Mot de passe trop court (minimum 8 caractères)')
      return
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    try {
      if (mode === 'login') {
        console.log('🔐 Tentative de connexion...')
        await login({ email: email || undefined, phone: phone || undefined, password })
        console.log('✅ Connexion réussie, redirection vers:', redirectTo)
      } else {
        console.log('📝 Tentative d\'inscription...')
        const result = await register({ email: email || undefined, phone: phone || undefined, password })
        console.log('✅ Inscription réussie:', result)
        
        // Pour l'inscription, afficher un message de confirmation
        if (result && !result.session) {
          setError('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.')
          return
        }
      }
      router.push(redirectTo)
    } catch (err) {
      console.error('❌ Erreur auth:', err)
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
            onClick={() => setMode('login')}
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
            onClick={() => setMode('register')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'register'
                ? 'bg-white text-ci-green shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Inscription
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@email.com"
            />
          </div>

          <div className="text-center text-sm text-gray-500">ou</div>

          <div>
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+225 XX XX XX XX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 caractères"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium mb-1">Confirmer mot de passe</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez votre mot de passe"
              />
            </div>
          )}

          {error && (
            <div className={`text-sm text-center p-2 rounded ${
              error.includes('réussie') 
                ? 'text-green-600 bg-green-50' 
                : 'text-red-600 bg-red-50'
            }`}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            variant="green"
            className="w-full flex items-center justify-center gap-2"
          >
            {loading && <LoadingSpinner />}
            {loading ? 'En cours...' : mode === 'login' ? 'Se connecter' : 'S\'inscrire'}
          </Button>
        </form>

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

        {/* Legal */}
        {mode === 'register' && (
          <p className="text-xs text-gray-500 text-center">
            En vous inscrivant, vous acceptez nos conditions d'utilisation
            et notre politique de confidentialité.
          </p>
        )}
      </Card>
    </div>
  )
}