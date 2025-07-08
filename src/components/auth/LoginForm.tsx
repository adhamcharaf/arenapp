'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginForm() {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signInWithEmail(email, password)
    } catch (err) {
      setError((err as Error).message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Mot de passe</label>
        <Input type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">{loading ? 'Connexion…' : 'Se connecter'}</Button>
    </form>
  )
}