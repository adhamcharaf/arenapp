// Constantes pour l'application ARENAPP Côte d'Ivoire

export const TIMEZONE = 'Africa/Abidjan'
export const CURRENCY = 'FCFA'

export const SPORT_TYPES = {
  padel: 'Padel',
  football: 'Football',
} as const

export const BOOKING_STATUS = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  completed: 'Terminé',
  no_show: 'Absent',
} as const

export const PAYMENT_PROVIDERS = {
  wave: 'Wave CI',
  orange: 'Orange Money',
  mtn: 'MTN Mobile Money',
} as const

export const PAYMENT_STATUS = {
  pending: 'En attente',
  completed: 'Terminé',
  failed: 'Échec',
  refunded: 'Remboursé',
} as const

export const AUTH_TYPES = {
  account: 'Compte',
  guest: 'Invité',
} as const

// Formats téléphone Côte d'Ivoire - Exactement 10 chiffres après normalisation
// Exemple: +2250747666667 (format international) -> 0747666667 (10 chiffres)
export const PHONE_REGEX = /^(\+225|225|0)?[0-9]{10}$/
export const PHONE_REGEX_STRICT = /^[0-9]{10}$/
export const PHONE_PREFIXES = ['01', '02', '03', '05', '07', '08', '09']

// Horaires d'ouverture par défaut
export const DEFAULT_HOURS = {
  start: '06:00',
  end: '22:00',
  slotDuration: 60, // minutes
}

// Limites système
export const LIMITS = {
  maxBookingsPerUser: 3,
  maxAdvanceBookingDays: 30,
  minBookingNoticeMins: 30,
}