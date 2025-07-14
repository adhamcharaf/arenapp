'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase-client'
import { User } from '@/types/database'
import type { Session } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  authType: 'account' | 'guest' | null
}

interface AuthContextType extends AuthState {
  signInWithEmail: (email: string, password: string) => Promise<any>
  signUpWithEmail: (email: string, password: string) => Promise<any>
  signInAsGuest: (phone: string) => Promise<any>
  signOut: () => Promise<void>
  registerComplete: (data: {
    email: string
    phone: string
    password: string
    first_name: string
    last_name: string
  }) => Promise<any>
  loginDual: (credentials: { 
    email?: string
    phone?: string
    password: string 
  }, redirectTo?: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    authType: null
  })

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (session) {
        await loadUserProfile(session)
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
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session ? 'Session présente' : 'Pas de session')
        
        if (session) {
          await loadUserProfile(session)
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

  // Fonction helper pour charger le profil utilisateur depuis public.users
  const loadUserProfile = async (session: Session) => {
    try {
      const { data: userProfile, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('❌ Erreur récupération profil utilisateur:', error)
        
        if (error.code === 'PGRST116') {
          console.error('❌ ERREUR CRITIQUE: Profil manquant dans public.users pour utilisateur connecté')
          await signOut()
          throw new Error('Profil utilisateur incomplet. Veuillez vous réinscrire pour corriger ce problème.')
        }
        
        setState({
          user: session.user as unknown as User,
          session,
          loading: false,
          authType: 'account'
        })
        return
      }

      const mergedUser: User = {
        ...session.user,
        ...userProfile,
        id: session.user.id
      } as User

      setState({
        user: mergedUser,
        session,
        loading: false,
        authType: userProfile.auth_type || 'account'
      })

    } catch (error) {
      console.error('❌ Erreur inattendue lors du chargement profil:', error)
      setState({
        user: session.user as unknown as User,
        session,
        loading: false,
        authType: 'account'
      })
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    console.log('🔐 Début connexion avec email:', email)
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('❌ Erreur connexion Supabase Auth:', error)
      throw error
    }
    
    return data
  }

  const signUpWithEmail = async (email: string, password: string) => {
    console.log('🔐 Début inscription avec email:', email)
    
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password
    })

    if (error) {
      console.error('❌ Erreur inscription Supabase Auth:', error)
      throw error
    }

    if (data.user) {
      console.log('👤 Utilisateur créé dans auth.users, le trigger va créer le profil automatiquement')
    }

    return data
  }

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

    setState({
      user: data.user,
      session: null,
      loading: false,
      authType: 'guest'
    })

    return data
  }

  const signOut = async () => {
    const { error } = await supabaseClient.auth.signOut()
    
    if (error) throw error

    setState({
      user: null,
      session: null,
      loading: false,
      authType: null
    })
  }

  const registerComplete = async (data: {
    email: string
    phone: string
    password: string
    first_name: string
    last_name: string
  }) => {
    console.log('📝 Début inscription complète via contexte')
    
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Erreur inscription:', result.error)
      throw new Error(result.error || 'Erreur lors de l\'inscription')
    }

    console.log('✅ Inscription réussie:', result)
    
    if (result.session) {
      await loadUserProfile(result.session)
    }
    
    return result
  }

  const loginDual = async (credentials: { 
    email?: string
    phone?: string
    password: string 
  }, redirectTo: string = '/') => {
    console.log('🔐 Début login dual étendu')
    
    const response = await fetch('/api/auth/dual', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Erreur login dual:', result.error)
      throw new Error(result.error || 'Erreur de connexion')
    }

    console.log('✅ Login dual réussi:', result)
    
    // Solution simplifiée : laisser la page gérer la redirection
    if (result.authType === 'guest') {
      // Pour les invités : mise à jour locale de l'état
      setState({
        user: result.user,
        session: null,
        loading: false,
        authType: 'guest'
      })
    }
    
    return result
  }

  const value: AuthContextType = {
    ...state,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    signOut,
    registerComplete,
    loginDual
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}