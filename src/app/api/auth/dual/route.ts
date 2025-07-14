import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { loginDualSchema, validatePhone } from '@/utils/validation'

// POST /api/auth/dual - Authentification dual (compte/invité)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginDualSchema.parse(body)
    
    // Créer le client Supabase avec gestion des cookies
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ 
              name, 
              value, 
              ...options,
              httpOnly: false, // Doit être false pour permettre la lecture côté client
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            })
          },
          remove(name: string, options: any) {
            cookieStore.set({ 
              name, 
              value: '', 
              ...options,
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 0
            })
          },
        },
      }
    )
    
    // Cas 1: Authentification par email/password (compte classique)
    if (validatedData.email && validatedData.password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      })
      
      if (error) {
        return NextResponse.json(
          { error: 'Erreur d\'authentification', details: error.message },
          { status: 401 }
        )
      }
      
      return NextResponse.json({
        success: true,
        user: data.user,
        session: data.session,
        authType: 'account'
      })
    }
    
    // Cas 2: Authentification par téléphone/password (compte avec téléphone)
    if (validatedData.phone && validatedData.password) {
      const normalizedPhone = validatePhone(validatedData.phone)
      
      // Chercher l'utilisateur par téléphone dans public.users
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', normalizedPhone)
        .eq('auth_type', 'account')
        .single()
      
      if (userError || !userProfile?.email) {
        return NextResponse.json(
          { error: 'Aucun compte trouvé avec ce numéro de téléphone' },
          { status: 401 }
        )
      }
      
      // Connecter avec l'email trouvé
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userProfile.email,
        password: validatedData.password,
      })
      
      if (error) {
        return NextResponse.json(
          { error: 'Mot de passe incorrect' },
          { status: 401 }
        )
      }
      
      return NextResponse.json({
        success: true,
        user: data.user,
        session: data.session,
        authType: 'account'
      })
    }
    
    // Cas 3: Réservation invité par téléphone uniquement (sans password)
    if (validatedData.phone && !validatedData.password) {
      const normalizedPhone = validatePhone(validatedData.phone)
      
      // Vérifier si l'utilisateur invité existe déjà
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', normalizedPhone)
        .eq('auth_type', 'guest')
        .single()
      
      if (userError && userError.code !== 'PGRST116') {
        return NextResponse.json(
          { error: 'Erreur de base de données', details: userError.message },
          { status: 500 }
        )
      }
      
      // Créer l'utilisateur invité s'il n'existe pas
      if (!existingUser) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            phone: normalizedPhone,
            auth_type: 'guest'
          })
          .select()
          .single()
        
        if (createError) {
          return NextResponse.json(
            { error: 'Erreur de création utilisateur', details: createError.message },
            { status: 500 }
          )
        }
        
        return NextResponse.json({
          success: true,
          user: newUser,
          session: null,
          authType: 'guest'
        })
      }
      
      return NextResponse.json({
        success: true,
        user: existingUser,
        session: null,
        authType: 'guest'
      })
    }
    
    return NextResponse.json(
      { error: 'Email+password, téléphone+password, ou téléphone seul requis' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Auth dual error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

// GET /api/auth/dual - Vérifier le statut d'authentification
export async function GET(_request: NextRequest) {
  try {
    // Créer le client Supabase avec gestion des cookies
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ 
              name, 
              value, 
              ...options,
              httpOnly: false, // Doit être false pour permettre la lecture côté client
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            })
          },
          remove(name: string, options: any) {
            cookieStore.set({ 
              name, 
              value: '', 
              ...options,
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 0
            })
          },
        },
      }
    )
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      return NextResponse.json({
        authenticated: true,
        user: session.user,
        authType: 'account'
      })
    }
    
    return NextResponse.json({
      authenticated: false,
      user: null,
      authType: null
    })
    
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}