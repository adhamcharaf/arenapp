import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/types/database'
import type { Session } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  authType: 'account' | 'guest' | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    authType: null
  })

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setState({
          // Cast via unknown to bypass structural mismatch with Supabase user
          user: session.user as unknown as User,
          session,
          loading: false,
          authType: 'account'
        })
      } else {
        setState({
          user: null,
          session: null,
          loading: false,
          authType: null
        })
      }
    }

    getInitialSession()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setState({
            user: session.user as unknown as User,
            session,
            loading: false,
            authType: 'account'
          })
        } else {
          setState({
            user: null,
            session: null,
            loading: false,
            authType: null
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Connexion avec email/password
  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  // Inscription avec email/password
  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) throw error
    return data
  }

  // Connexion invité par téléphone
  const signInAsGuest = async (phone: string) => {
    const response = await fetch('/api/auth/dual', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erreur de connexion invité')
    }

    // Mettre à jour l'état local pour l'invité
    setState({
      user: data.user,
      session: null,
      loading: false,
      authType: 'guest'
    })

    return data
  }

  // Déconnexion
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) throw error

    setState({
      user: null,
      session: null,
      loading: false,
      authType: null
    })
  }

  return {
    ...state,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    signOut
  }
}