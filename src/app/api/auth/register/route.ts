import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { registerSchema, validatePhone } from '@/utils/validation'

// POST /api/auth/register - Inscription complète avec email + téléphone + noms
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 Début inscription complète:', { ...body, password: '[HIDDEN]' })
    
    // Validation des données
    const validatedData = registerSchema.parse(body)
    const normalizedPhone = validatePhone(validatedData.phone)
    
    console.log('✅ Données validées:', {
      email: validatedData.email,
      phone: normalizedPhone,
      first_name: validatedData.first_name,
      last_name: validatedData.last_name
    })
    
    // Utiliser le client admin pour vérifier l'unicité
    if (!supabaseAdmin) {
      throw new Error('Service role key non configuré')
    }
    
    // Vérifier unicité email
    const { data: existingEmail } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single()
    
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      )
    }
    
    // Vérifier unicité téléphone
    const { data: existingPhone } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone', normalizedPhone)
      .single()
    
    if (existingPhone) {
      return NextResponse.json(
        { error: 'Un compte avec ce numéro de téléphone existe déjà' },
        { status: 400 }
      )
    }
    
    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          first_name: validatedData.first_name,
          last_name: validatedData.last_name,
          phone: normalizedPhone
        }
      }
    })
    
    if (authError) {
      console.error('❌ Erreur Supabase Auth:', authError)
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte', details: authError.message },
        { status: 400 }
      )
    }
    
    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 500 }
      )
    }
    
    console.log('✅ Utilisateur créé dans auth.users:', authData.user.id)
    
    // Créer/mettre à jour le profil dans public.users avec toutes les données
    const profileData = {
      id: authData.user.id,
      email: validatedData.email,
      phone: normalizedPhone,
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      auth_type: 'account' as const
    }
    
    console.log('📝 Création profil utilisateur:', profileData)
    
    // Utiliser le client admin pour créer le profil (bypass RLS)
    const { data: profileResult, error: profileError } = await supabaseAdmin
      .from('users')
      .upsert(profileData, { onConflict: 'id' })
      .select()
    
    if (profileError) {
      console.error('❌ ERREUR CRITIQUE - Échec création profil:', profileError)
      
      // Si le profil n'a pas pu être créé, supprimer l'utilisateur auth
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { 
          error: 'Erreur lors de la création du profil utilisateur', 
          details: profileError.message 
        },
        { status: 500 }
      )
    }
    
    console.log('✅ Profil utilisateur créé avec succès:', profileResult)
    
    return NextResponse.json({
      success: true,
      user: authData.user,
      session: authData.session,
      message: authData.session ? 'Compte créé avec succès' : 'Compte créé, vérifiez votre email'
    })
    
  } catch (error) {
    console.error('❌ Erreur inscription:', error)
    
    if (error instanceof Error && error.message.includes('téléphone')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'inscription' },
      { status: 500 }
    )
  }
}