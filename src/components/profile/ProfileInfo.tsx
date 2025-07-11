'use client'

import { User } from '@/types/database'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common/LoadingStates'

interface ProfileInfoProps {
  user: User
  loading?: boolean
}

export default function ProfileInfo({ user, loading }: ProfileInfoProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Card className="border-ci-orange">
      <CardHeader className="bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Badge type de compte */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Type de compte</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            user.auth_type === 'account' 
              ? 'bg-ci-green/10 text-ci-green' 
              : 'bg-ci-orange/10 text-ci-orange'
          }`}>
            {user.auth_type === 'account' ? 'Compte' : 'Invité'}
          </span>
        </div>

        {/* Email ou téléphone selon le type */}
        {user.auth_type === 'account' && user.email ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email</span>
            </div>
            <p className="font-medium text-gray-900">{user.email}</p>
          </div>
        ) : user.phone ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Téléphone</span>
            </div>
            <p className="font-medium text-gray-900">{user.phone}</p>
          </div>
        ) : null}

        {/* Date d'inscription */}
        <div className="space-y-2">
          <span className="text-sm text-gray-600">Membre depuis</span>
          <p className="font-medium text-gray-900">{formatDate(user.created_at)}</p>
        </div>

        {/* Actions selon le type de compte */}
        <div className="pt-4 border-t">
          {user.auth_type === 'account' ? (
            <Button variant="outline" className="w-full">
              Changer le mot de passe
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center">
                Créez un compte pour sauvegarder vos réservations
              </p>
              <Button variant="green" className="w-full">
                Créer un compte
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}