import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { authSchema, validatePhone } from '@/utils/validation'

// POST /api/auth/dual - Authentification dual (compte/invité)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = authSchema.parse(body)
    
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
    
    // Cas 2: Réservation invité par téléphone uniquement
    if (validatedData.phone) {
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
      { error: 'Email/password ou téléphone requis' },
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