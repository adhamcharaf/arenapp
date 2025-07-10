'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function AuthButton() {
  const { user, authType, loading, signOut } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 hidden sm:block">
          {authType === 'guest' ? 'Invité' : user.email}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="text-ci-green border-ci-green hover:bg-ci-green hover:text-white"
        >
          Déconnexion
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="green"
      size="sm"
      onClick={() => router.push('/auth/login')}
      className="bg-ci-green hover:bg-ci-green/90"
    >
      Connexion
    </Button>
  )
}