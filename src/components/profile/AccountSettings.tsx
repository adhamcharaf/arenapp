'use client'

import React, { useState } from 'react'
import { User } from '@/types/database'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/common/LoadingStates'

interface AccountSettingsProps {
  user: User
  onSignOut: () => void
  onDeleteAccount?: () => void
}

export default function AccountSettings({ user, onSignOut, onDeleteAccount }: AccountSettingsProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas')
      return
    }
    if (newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    
    setIsLoading(true)
    try {
      // TODO: Implémenter le changement de mot de passe
      console.log('Changement de mot de passe...')
      alert('Fonctionnalité à venir')
    } finally {
      setIsLoading(false)
      setShowPasswordModal(false)
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const handleDeleteAccount = async () => {
    if (user.email && deleteConfirmEmail !== user.email) {
      alert('L\'email ne correspond pas')
      return
    }
    
    setIsLoading(true)
    try {
      // TODO: Implémenter la suppression du compte
      console.log('Suppression du compte...')
      alert('Fonctionnalité à venir')
    } finally {
      setIsLoading(false)
      setShowDeleteModal(false)
    }
  }

  const handleSignOut = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      await onSignOut()
    }
  }

  return (
    <>
      <Card className="border-gray-200">
        <CardHeader className="bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Paramètres du compte</h2>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Actions pour compte email */}
          {user.auth_type === 'account' && (
            <>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowPasswordModal(true)}
              >
                Changer le mot de passe
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full text-red-600 hover:bg-red-50 border-red-300"
                onClick={() => setShowDeleteModal(true)}
              >
                Supprimer mon compte
              </Button>
            </>
          )}

          {/* Actions pour invité */}
          {user.auth_type === 'guest' && (
            <div className="p-4 bg-ci-orange/10 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Créez un compte complet
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Ajoutez un email et un mot de passe pour sécuriser votre compte et accéder à toutes les fonctionnalités.
              </p>
              <Button variant="green" className="w-full">
                Convertir en compte
              </Button>
            </div>
          )}

          {/* Déconnexion */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleSignOut}
          >
            Se déconnecter
          </Button>
        </CardContent>
      </Card>

      {/* Modal changement mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Changer le mot de passe</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 caractères"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez le nouveau mot de passe"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPasswordModal(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                className="flex-1"
                onClick={handlePasswordChange}
                disabled={isLoading || !newPassword || !confirmPassword}
              >
                {isLoading ? <LoadingSpinner /> : 'Changer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression compte */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-red-600">
              Supprimer le compte
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Attention !</strong> Cette action est irréversible. 
                  Toutes vos données et réservations seront définitivement supprimées.
                </p>
              </div>
              
              {user.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmez votre email pour continuer
                  </label>
                  <Input
                    type="email"
                    value={deleteConfirmEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeleteConfirmEmail(e.target.value)}
                    placeholder={user.email}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteModal(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                variant="default"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDeleteAccount}
                disabled={isLoading || (!!user.email && deleteConfirmEmail !== user.email)}
              >
                {isLoading ? <LoadingSpinner /> : 'Supprimer définitivement'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}