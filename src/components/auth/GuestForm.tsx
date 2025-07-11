'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import PhoneInput from '@/components/ui/PhoneInput'
import { LoadingSpinner } from '@/components/common/LoadingStates'
import { validatePhone10Digits } from '@/utils/validation'

export default function GuestForm() {
  const { signInAsGuest } = useAuth()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validation du téléphone (10 chiffres exactement)
    const phoneDigits = phone.replace('+225', '')
    if (!validatePhone10Digits(phoneDigits)) {
      setError('Le numéro de téléphone doit contenir exactement 10 chiffres')
      return
    }
    
    setLoading(true)
    try {
      await signInAsGuest(phone)
    } catch (err) {
      setError((err as Error).message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Téléphone <span className="text-red-500">*</span>
        </label>
        <PhoneInput
          value={phone}
          onChange={setPhone}
          error={error || undefined}
          placeholder="XXXXXXXXXX"
          required
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={loading || !validatePhone10Digits(phone.replace('+225', ''))} 
        className="w-full flex items-center justify-center gap-2"
      >
        {loading && <LoadingSpinner />}
        {loading ? 'Connexion…' : 'Continuer en invité'}
      </Button>
    </form>
  )
}