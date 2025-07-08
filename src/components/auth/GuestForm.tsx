'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PHONE_REGEX } from '@/utils/constants'

export default function GuestForm() {
  const { signInAsGuest } = useAuth()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!PHONE_REGEX.test(phone)) {
      setError('Numéro de téléphone invalide')
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
        <label className="block text-sm font-medium mb-1">Téléphone (+225)</label>
        <Input type="tel" value={phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} placeholder="07XXXXXXXX" required />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">{loading ? 'Connexion…' : 'Continuer en invité'}</Button>
    </form>
  )
}