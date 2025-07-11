'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PhoneInput from '@/components/ui/PhoneInput'
import { LoadingSpinner } from '@/components/common/LoadingStates'
import { validateEmail, validatePhone10Digits } from '@/utils/validation'

interface LoginFormProps {
  onSubmit: (data: LoginData) => Promise<void>
  loading?: boolean
  error?: string | null
}

export interface LoginData {
  email?: string
  phone?: string
  password: string
}

export default function LoginForm({ onSubmit, loading = false, error }: LoginFormProps) {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    phone: '',
    password: ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginData, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof LoginData, boolean>>>({})

  const validateField = (field: keyof LoginData, value: string) => {
    switch (field) {
      case 'email':
        return value ? (validateEmail(value) ? '' : 'Format email invalide') : 'Email requis'
      case 'phone':
        return value ? (validatePhone10Digits(value.replace('+225', '')) ? '' : 'Numéro de téléphone invalide') : 'Téléphone requis'
      case 'password':
        return value.length >= 8 ? '' : 'Mot de passe minimum 8 caractères'
      default:
        return ''
    }
  }

  const handleFieldChange = (field: keyof LoginData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }))
    }
  }

  const handleBlur = (field: keyof LoginData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const value = formData[field] || ''
    setErrors(prev => ({ ...prev, [field]: validateField(field, value) }))
  }

  const handleMethodChange = (method: 'email' | 'phone') => {
    setLoginMethod(method)
    // Nettoyer les erreurs de l'autre méthode
    if (method === 'email') {
      setErrors(prev => ({ ...prev, phone: '' }))
      setTouched(prev => ({ ...prev, phone: false }))
      setFormData(prev => ({ ...prev, phone: '' }))
    } else {
      setErrors(prev => ({ ...prev, email: '' }))
      setTouched(prev => ({ ...prev, email: false }))
      setFormData(prev => ({ ...prev, email: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Valider le champ actif et password
    const activeField = loginMethod
    const requiredFields: (keyof LoginData)[] = [activeField, 'password']
    
    setTouched(Object.fromEntries(requiredFields.map(field => [field, true])))
    
    const newErrors: typeof errors = {}
    requiredFields.forEach(field => {
      const value = formData[field] || ''
      const error = validateField(field, value)
      if (error) newErrors[field] = error
    })
    
    setErrors(newErrors)
    
    // Si pas d'erreurs, soumettre
    if (Object.keys(newErrors).length === 0) {
      const submitData: LoginData = {
        password: formData.password
      }
      
      if (loginMethod === 'email') {
        submitData.email = formData.email
      } else {
        submitData.phone = formData.phone
      }
      
      await onSubmit(submitData)
    }
  }

  const hasErrors = Object.values(errors).some(error => error)
  const activeFieldFilled = loginMethod === 'email' ? formData.email : formData.phone
  const canSubmit = activeFieldFilled && formData.password && !hasErrors

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Méthode de connexion */}
      <div className="flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => handleMethodChange('email')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            loginMethod === 'email'
              ? 'bg-white text-ci-green shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange('phone')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            loginMethod === 'phone'
              ? 'bg-white text-ci-green shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Téléphone
        </button>
      </div>

      {/* Champ Email ou Téléphone */}
      {loginMethod === 'email' ? (
        <div>
          <label className="block text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="exemple@email.com"
            className={errors.email && touched.email ? 'border-red-500' : ''}
          />
          {errors.email && touched.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium mb-1">
            Téléphone <span className="text-red-500">*</span>
          </label>
          <PhoneInput
            value={formData.phone || ''}
            onChange={(value) => handleFieldChange('phone', value)}
            error={errors.phone && touched.phone ? errors.phone : undefined}
            placeholder="XXXXXXXXXX"
          />
        </div>
      )}

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
          placeholder="Votre mot de passe"
          className={errors.password && touched.password ? 'border-red-500' : ''}
        />
        {errors.password && touched.password && (
          <p className="text-sm text-red-600 mt-1">{errors.password}</p>
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
        disabled={loading || !canSubmit}
        variant="green"
        className="w-full flex items-center justify-center gap-2"
      >
        {loading && <LoadingSpinner />}
        {loading ? 'Connexion...' : 'Se connecter'}
      </Button>
    </form>
  )
}