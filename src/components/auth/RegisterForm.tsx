'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PhoneInput from '@/components/ui/PhoneInput'
import { LoadingSpinner } from '@/components/common/LoadingStates'
import { validateEmail, validatePhone10Digits } from '@/utils/validation'

interface RegisterFormProps {
  onSubmit: (data: RegisterData) => Promise<void>
  loading?: boolean
  error?: string | null
}

export interface RegisterData {
  email: string
  phone: string
  password: string
  first_name: string
  last_name: string
}

export default function RegisterForm({ onSubmit, loading = false, error }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    phone: '',
    password: '',
    first_name: '',
    last_name: ''
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData | 'confirmPassword', string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterData | 'confirmPassword', boolean>>>({})

  const validateField = (field: keyof RegisterData | 'confirmPassword', value: string) => {
    switch (field) {
      case 'email':
        return value ? (validateEmail(value) ? '' : 'Format email invalide') : 'Email requis'
      case 'phone':
        return value ? (validatePhone10Digits(value.replace('+225', '')) ? '' : 'Numéro de téléphone invalide') : 'Téléphone requis'
      case 'password':
        return value.length >= 8 ? '' : 'Mot de passe minimum 8 caractères'
      case 'first_name':
        return value.trim() ? '' : 'Prénom requis'
      case 'last_name':
        return value.trim() ? '' : 'Nom requis'
      case 'confirmPassword':
        return value === formData.password ? '' : 'Les mots de passe ne correspondent pas'
      default:
        return ''
    }
  }

  const handleFieldChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }))
    }
    
    // Revalider confirmPassword si password change
    if (field === 'password' && touched.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: validateField('confirmPassword', confirmPassword) }))
    }
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    if (touched.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: validateField('confirmPassword', value) }))
    }
  }

  const handleBlur = (field: keyof RegisterData | 'confirmPassword') => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const value = field === 'confirmPassword' ? confirmPassword : formData[field as keyof RegisterData]
    setErrors(prev => ({ ...prev, [field]: validateField(field, value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Marquer tous les champs comme touchés
    const allFields: (keyof RegisterData | 'confirmPassword')[] = ['email', 'phone', 'password', 'first_name', 'last_name', 'confirmPassword']
    setTouched(Object.fromEntries(allFields.map(field => [field, true])))
    
    // Valider tous les champs
    const newErrors: typeof errors = {}
    allFields.forEach(field => {
      const value = field === 'confirmPassword' ? confirmPassword : formData[field as keyof RegisterData]
      const error = validateField(field, value)
      if (error) newErrors[field] = error
    })
    
    setErrors(newErrors)
    
    // Si pas d'erreurs, soumettre
    if (Object.keys(newErrors).length === 0) {
      await onSubmit(formData)
    }
  }

  const hasErrors = Object.values(errors).some(error => error)
  const allFieldsFilled = Object.values(formData).every(value => value.trim()) && confirmPassword

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Prénom et Nom */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Prénom <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.first_name}
            onChange={(e) => handleFieldChange('first_name', e.target.value)}
            onBlur={() => handleBlur('first_name')}
            placeholder="Jean"
            className={errors.first_name && touched.first_name ? 'border-red-500' : ''}
          />
          {errors.first_name && touched.first_name && (
            <p className="text-sm text-red-600 mt-1">{errors.first_name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Nom <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.last_name}
            onChange={(e) => handleFieldChange('last_name', e.target.value)}
            onBlur={() => handleBlur('last_name')}
            placeholder="Dupont"
            className={errors.last_name && touched.last_name ? 'border-red-500' : ''}
          />
          {errors.last_name && touched.last_name && (
            <p className="text-sm text-red-600 mt-1">{errors.last_name}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="jean.dupont@email.com"
          className={errors.email && touched.email ? 'border-red-500' : ''}
        />
        {errors.email && touched.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email}</p>
        )}
      </div>

      {/* Téléphone */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Téléphone <span className="text-red-500">*</span>
        </label>
        <PhoneInput
          value={formData.phone}
          onChange={(value) => handleFieldChange('phone', value)}
          error={errors.phone && touched.phone ? errors.phone : undefined}
          placeholder="XXXXXXXXXX"
        />
      </div>

      {/* Mot de passe */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Mot de passe <span className="text-red-500">*</span>
        </label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => handleFieldChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          placeholder="Minimum 8 caractères"
          className={errors.password && touched.password ? 'border-red-500' : ''}
        />
        {errors.password && touched.password && (
          <p className="text-sm text-red-600 mt-1">{errors.password}</p>
        )}
      </div>

      {/* Confirmation mot de passe */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Confirmer mot de passe <span className="text-red-500">*</span>
        </label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
          onBlur={() => handleBlur('confirmPassword')}
          placeholder="Répétez votre mot de passe"
          className={errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}
        />
        {errors.confirmPassword && touched.confirmPassword && (
          <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Erreur générale */}
      {error && (
        <div className="text-sm text-center p-2 rounded bg-red-50 text-red-600">
          {error}
        </div>
      )}

      {/* Bouton de soumission */}
      <Button
        type="submit"
        disabled={loading || hasErrors || !allFieldsFilled}
        variant="green"
        className="w-full flex items-center justify-center gap-2"
      >
        {loading && <LoadingSpinner />}
        {loading ? 'Inscription...' : 'Créer mon compte'}
      </Button>

      {/* Texte légal */}
      <p className="text-xs text-gray-500 text-center">
        En vous inscrivant, vous acceptez nos conditions d'utilisation
        et notre politique de confidentialité.
      </p>
    </form>
  )
}