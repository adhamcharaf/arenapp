'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { validatePhone10Digits } from '@/utils/validation'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  error?: string
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = "XXXXXXXXXX",
  disabled = false,
  required = false,
  className = "",
  error
}: PhoneInputProps) {
  const [localValue, setLocalValue] = useState('')
  const [isValid, setIsValid] = useState(true)

  // Synchroniser avec la valeur externe
  useEffect(() => {
    if (value.startsWith('+225')) {
      setLocalValue(value.substring(4))
    } else {
      setLocalValue(value)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '') // Garder seulement les chiffres
    
    // Limiter à 10 chiffres
    if (input.length <= 10) {
      setLocalValue(input)
      
      // Valider et notifier le parent
      const valid = validatePhone10Digits(input)
      setIsValid(valid || input.length === 0) // Accepter vide pour en cours de saisie
      
      // Retourner le format complet au parent si valide
      if (valid) {
        onChange(`+225${input}`)
      } else {
        onChange(input) // Retourner tel quel si pas encore valide
      }
    }
  }

  const handleBlur = () => {
    // Validation finale au blur
    if (localValue && !validatePhone10Digits(localValue)) {
      setIsValid(false)
    }
  }

  return (
    <div className="space-y-1">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
          +225
        </div>
        <div className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-400">
          |
        </div>
        <Input
          type="tel"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`pl-16 ${className} ${
            !isValid && localValue ? 'border-red-500 focus:border-red-500' : ''
          }`}
          maxLength={10}
        />
      </div>
      
      {/* Messages de validation */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {!isValid && localValue && !error && (
        <p className="text-sm text-red-600">
          Le numéro doit contenir exactement 10 chiffres
        </p>
      )}
      {localValue && localValue.length > 0 && localValue.length < 10 && isValid && (
        <p className="text-sm text-gray-500">
          {10 - localValue.length} chiffre(s) restant(s)
        </p>
      )}
      {isValid && localValue.length === 10 && (
        <p className="text-sm text-green-600">
          ✓ Numéro valide : +225{localValue}
        </p>
      )}
    </div>
  )
}