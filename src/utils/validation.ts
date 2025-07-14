import { z } from 'zod'
import { PHONE_REGEX } from './constants'

// Validation pour l'authentification dual
export const authSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(PHONE_REGEX, 'Numéro de téléphone invalide').optional(),
  password: z.string().min(8).optional(),
}).refine((data) => data.email || data.phone, {
  message: 'Email ou téléphone requis',
})

// Validation pour l'inscription complète
export const registerSchema = z.object({
  email: z.string().email('Format email invalide'),
  phone: z.string().regex(PHONE_REGEX, 'Numéro de téléphone invalide'),
  password: z.string().min(8, 'Mot de passe minimum 8 caractères'),
  first_name: z.string().min(1, 'Prénom requis').trim(),
  last_name: z.string().min(1, 'Nom requis').trim(),
})

// Validation pour login dual étendu (email+password OU phone+password)
export const loginDualSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(PHONE_REGEX, 'Numéro de téléphone invalide').optional(),
  password: z.string().min(8, 'Mot de passe requis'),
}).refine((data) => data.email || data.phone, {
  message: 'Email ou téléphone requis',
})

// Validation pour les réservations
export const bookingSchema = z.object({
  venue_id: z.string().uuid(),
  time_slot_id: z.string().uuid(),
  phone_number: z.string().regex(PHONE_REGEX, 'Numéro de téléphone invalide'),
  notes: z.string().optional(),
})

// Validation pour les paiements
export const paymentSchema = z.object({
  booking_id: z.string().uuid(),
  provider: z.enum(['wave', 'orange', 'mtn']),
  amount: z.number().positive(),
  phone_number: z.string().regex(PHONE_REGEX, 'Numéro de téléphone invalide'),
})

// Validation pour les terrains
export const venueSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  sport_type: z.enum(['padel', 'football']),
  location: z.string().min(1, 'Localisation requise'),
  price_per_hour: z.number().positive(),
  description: z.string().optional(),
})

// Validation pour les créneaux
export const timeSlotSchema = z.object({
  venue_id: z.string().uuid(),
  start_time: z.string(),
  end_time: z.string(),
}).refine((data) => {
  const start = new Date(data.start_time)
  const end = new Date(data.end_time)
  return start < end
}, {
  message: 'Heure de fin doit être après heure de début',
})

// Utilitaires de validation
export const validatePhone = (phone: string): string => {
  console.log('📞 Validation téléphone - Input:', phone)
  
  // Normaliser le numéro de téléphone ivoirien - doit être exactement 10 chiffres
  let normalized = phone.replace(/\s+/g, '')
  console.log('📞 Après suppression espaces:', normalized)
  
  if (normalized.startsWith('+225')) {
    normalized = normalized.substring(4)
  } else if (normalized.startsWith('225')) {
    normalized = normalized.substring(3)
  } else if (normalized.startsWith('0')) {
    normalized = normalized.substring(1)
  }
  
  console.log('📞 Après normalisation préfixe:', normalized)
  
  // Vérifier que c'est exactement 10 chiffres (format ivoirien standard)
  if (!/^[0-9]{10}$/.test(normalized)) {
    const error = `Le numéro de téléphone doit contenir exactement 10 chiffres (reçu: ${normalized.length} chiffres)`
    console.log('❌ Erreur validation:', error)
    throw new Error(error)
  }
  
  const result = `+225${normalized}`
  console.log('✅ Téléphone validé:', result)
  return result
}

export const validatePhone10Digits = (phone: string): boolean => {
  const cleaned = phone.replace(/\s+/g, '')
  return /^[0-9]{10}$/.test(cleaned)
}

export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success
}