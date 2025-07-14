// Hook simplifié qui utilise le contexte AuthContext
import { useAuth as useAuthContext } from '@/contexts/AuthContext'

export interface AuthState {
  user: any | null
  session: any | null
  loading: boolean
  authType: 'account' | 'guest' | null
}

export function useAuth() {
  const context = useAuthContext()
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}