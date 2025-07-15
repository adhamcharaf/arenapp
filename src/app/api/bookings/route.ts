import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { bookingSchema, validatePhone } from '@/utils/validation'

// GET /api/bookings - Récupérer les réservations
export async function GET(request: NextRequest) {
  // Créer le client Supabase server-aware avec gestion des cookies
  const supabase = createSupabaseServerClient(request)
  
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const venueId = searchParams.get('venueId')
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        user:users(*),
        venue:venues(*),
        time_slot:time_slots(*),
        payment:payments(*)
      `)
      .order('created_at', { ascending: false })
    
    // Filtres
    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (status) {
      query = query.eq('status', status as import('@/types/database').BookingStatus)
    }
    if (venueId) {
      query = query.eq('venue_id', venueId)
    }
    
    const { data, error } = await query
    
    if (error) {
      return NextResponse.json(
        { error: 'Erreur de récupération', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      bookings: data
    })
    
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Créer une réservation
export async function POST(request: NextRequest) {
  // Créer le client Supabase server-aware avec gestion des cookies
  const supabase = createSupabaseServerClient(request)
  
  try {
    console.log('🔄 Début création réservation')
    const body = await request.json()
    console.log('📝 Données reçues:', JSON.stringify(body, null, 2))
    
    const validatedData = bookingSchema.parse(body)
    console.log('✅ Validation réussie:', JSON.stringify(validatedData, null, 2))
    
    const normalizedPhone = validatePhone(validatedData.phone_number)
    console.log('📞 Téléphone normalisé:', normalizedPhone)
    
    // APPROCHE ATOMIQUE: Vérifier et verrouiller en une seule opération avec retry
    console.log('🔒 Verrouillage atomique du créneau:', validatedData.time_slot_id)
    
    let lockedSlot = null
    let lockError = null
    const maxRetries = 3
    const retryDelay = 100 // ms
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Tentative de verrouillage ${attempt}/${maxRetries}`)
      
      const result = await supabase
        .from('time_slots')
        .update({ is_available: false })
        .eq('id', validatedData.time_slot_id)
        .eq('venue_id', validatedData.venue_id)  // Validation cohérence intégrée
        .eq('is_available', true)  // Condition de disponibilité
        .select('*, venue:venues(*)')
        .single()
      
      lockedSlot = result.data
      lockError = result.error
      
      if (lockedSlot) {
        console.log(`✅ Verrouillage réussi à la tentative ${attempt}`)
        break
      }
      
      if (attempt < maxRetries) {
        console.log(`⏳ Tentative ${attempt} échouée, retry dans ${retryDelay}ms...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
    
    console.log('📅 Verrouillage résultat:', lockedSlot ? 'SUCCÈS' : 'ÉCHEC')
    if (lockError) {
      console.log('❌ Erreur verrouillage:', lockError)
      console.log('📊 Détails erreur:', JSON.stringify(lockError, null, 2))
    }
    
    if (lockError || !lockedSlot) {
      // Diagnostiquer pourquoi le verrouillage a échoué
      console.log('🔍 Diagnostic: Vérification de l\'état du créneau...')
      
      const { data: currentSlot, error: checkError } = await supabase
        .from('time_slots')
        .select('*, venue:venues(*)')
        .eq('id', validatedData.time_slot_id)
        .single()
      
      if (checkError) {
        console.log('❌ Créneau inexistant:', checkError)
        return NextResponse.json(
          { error: 'Créneau introuvable' },
          { status: 404 }
        )
      }
      
      console.log('📊 État actuel du créneau:', JSON.stringify(currentSlot, null, 2))
      
      // Vérifier la cohérence venue/slot
      if (currentSlot.venue_id !== validatedData.venue_id) {
        console.log('❌ ERREUR COHÉRENCE - Créneau n\'appartient pas au terrain')
        return NextResponse.json(
          { 
            error: 'Incohérence: le créneau sélectionné n\'appartient pas au terrain choisi',
            details: {
              requested_venue: validatedData.venue_id,
              slot_venue: currentSlot.venue_id,
              slot_venue_name: currentSlot.venue?.name
            }
          },
          { status: 400 }
        )
      }
      
      // Vérifier la disponibilité
      if (!currentSlot.is_available) {
        console.log('❌ Créneau déjà réservé')
        return NextResponse.json(
          { error: 'Créneau déjà réservé par un autre utilisateur' },
          { status: 409 }
        )
      }
      
      // Erreur inexpliquée
      console.log('❌ Erreur de verrouillage inexpliquée')
      return NextResponse.json(
        { error: 'Erreur système lors du verrouillage du créneau' },
        { status: 500 }
      )
    }
    
    console.log('✅ Créneau verrouillé avec succès:', lockedSlot.id)
    
    // Utiliser les données du créneau verrouillé
    const timeSlot = lockedSlot
    
    // Vérifier qu'il n'y a pas déjà une réservation pour ce créneau
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('time_slot_id', validatedData.time_slot_id)
      .not('status', 'eq', 'cancelled')
      .single()
    
    if (existingBooking) {
      return NextResponse.json(
        { error: 'Créneau déjà réservé' },
        { status: 409 }
      )
    }
    
    // Déterminer l'utilisateur (compte ou invité)
    let userId = null
    console.log('🔐 Vérification session utilisateur...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('❌ Erreur session:', sessionError)
    }
    console.log('👤 Session trouvée:', session ? 'OUI (Utilisateur connecté)' : 'NON (Mode invité)')
    
    if (session) {
      userId = session.user.id
      console.log('✅ Utilisateur connecté ID:', userId)
    } else {
      // Utilisateur invité - utiliser UPSERT pour éviter les conflits
      console.log('🔍 Création/Récupération utilisateur invité avec téléphone:', normalizedPhone)
      
      try {
        // Utiliser UPSERT pour gérer les doublons automatiquement
        const { data: guestUser, error: upsertError } = await supabase
          .from('users')
          .upsert(
            {
              phone: normalizedPhone,
              auth_type: 'guest'
            },
            {
              onConflict: 'phone',
              ignoreDuplicates: false
            }
          )
          .select('id')
          .single()
        
        if (upsertError) {
          console.log('❌ Erreur UPSERT utilisateur invité:', upsertError)
          console.log('❌ Détails erreur:', JSON.stringify(upsertError, null, 2))
          
          // Fallback: essayer de récupérer l'utilisateur existant
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('phone', normalizedPhone)
            .eq('auth_type', 'guest')
            .single()
          
          if (fetchError || !existingUser) {
            console.log('❌ Impossible de récupérer l\'utilisateur existant:', fetchError)
            return NextResponse.json(
              { 
                error: 'Erreur création utilisateur', 
                details: `UPSERT failed: ${upsertError.message}, Fetch failed: ${fetchError?.message}`,
                phone: normalizedPhone
              },
              { status: 500 }
            )
          }
          
          userId = existingUser.id
          console.log('✅ Fallback: Utilisateur existant récupéré:', userId)
        } else {
          userId = guestUser.id
          console.log('✅ UPSERT réussi - Utilisateur invité ID:', userId)
        }
      } catch (error) {
        console.log('❌ Erreur critique lors de la gestion utilisateur invité:', error)
        return NextResponse.json(
          { 
            error: 'Erreur système utilisateur', 
            details: error instanceof Error ? error.message : 'Erreur inconnue',
            phone: normalizedPhone
          },
          { status: 500 }
        )
      }
    }
    
    // Créer la réservation avec transaction atomique
    console.log('📝 Création de la réservation avec transaction...')
    const bookingData = {
      user_id: userId,
      venue_id: validatedData.venue_id,
      time_slot_id: validatedData.time_slot_id,
      phone_number: normalizedPhone,
      total_amount: timeSlot.venue.price_per_hour,
      notes: validatedData.notes,
      status: 'pending' as import('@/types/database').BookingStatus
    }
    console.log('📋 Données réservation:', JSON.stringify(bookingData, null, 2))
    
    // Créer la réservation (le créneau est déjà verrouillé)
    try {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select(`
          *,
          user:users(*),
          venue:venues(*),
          time_slot:time_slots(*)
        `)
        .single()
      
      if (bookingError) {
        console.log('❌ Erreur création réservation:', bookingError)
        
        // Restaurer la disponibilité du créneau en cas d'erreur
        console.log('🔄 Restauration du créneau...')
        await supabase
          .from('time_slots')
          .update({ is_available: true })
          .eq('id', validatedData.time_slot_id)
        
        // Vérifier si c'est un conflit de créneau
        if (bookingError.message.includes('duplicate') || bookingError.message.includes('unique')) {
          return NextResponse.json(
            { error: 'Créneau déjà réservé par un autre utilisateur', details: bookingError.message },
            { status: 409 }
          )
        }
        
        return NextResponse.json(
          { error: 'Erreur création réservation', details: bookingError.message },
          { status: 500 }
        )
      }
      
      console.log('✅ Réservation créée avec succès:', booking.id)
      
      // Créer entrée dans l'historique
      const { error: historyError } = await supabase
        .from('booking_history')
        .insert({
          booking_id: booking.id,
          action: 'CREATED',
          notes: 'Réservation créée'
        })
      
      if (historyError) {
        console.log('⚠️ Erreur création historique:', historyError)
        // Note: on continue malgré l'erreur car la réservation est créée
      }
      
      console.log('🎉 Processus de réservation terminé avec succès')
      return NextResponse.json({
        success: true,
        booking,
        message: 'Réservation créée avec succès'
      })
      
    } catch (transactionError) {
      console.log('❌ Erreur transaction réservation:', transactionError)
      return NextResponse.json(
        { 
          error: 'Erreur transaction réservation', 
          details: transactionError instanceof Error ? transactionError.message : 'Erreur inconnue'
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('❌ ERREUR GLOBALE Create booking:', error)
    console.error('📍 Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace')
    console.error('📍 Type d\'erreur:', typeof error)
    console.error('📍 Error name:', error instanceof Error ? error.name : 'Unknown')
    
    // Gestion spécifique des erreurs de validation
    if (error instanceof Error) {
      if (error.message.includes('Variables d\'environnement Supabase')) {
        return NextResponse.json(
          { error: 'Configuration Supabase manquante' },
          { status: 500 }
        )
      }
      
      if (error.message.includes('téléphone')) {
        return NextResponse.json(
          { error: 'Numéro de téléphone invalide', details: error.message },
          { status: 400 }
        )
      }
      
      if (error.message.includes('ZodError')) {
        return NextResponse.json(
          { error: 'Données de réservation invalides', details: error.message },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur', 
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        type: typeof error,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// PUT /api/bookings - Mettre à jour une réservation
export async function PUT(request: NextRequest) {
  // Créer le client Supabase server-aware avec gestion des cookies
  const supabase = createSupabaseServerClient(request)
  
  try {
    const body = await request.json()
    const { id, status, notes } = body
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID et statut requis' },
        { status: 400 }
      )
    }
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        status,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        user:users(*),
        venue:venues(*),
        time_slot:time_slots(*)
      `)
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: 'Erreur mise à jour', details: error.message },
        { status: 500 }
      )
    }
    
    // Ajouter à l'historique
    await supabase
      .from('booking_history')
      .insert({
        booking_id: id,
        action: `STATUS_CHANGED_TO_${status.toUpperCase()}`,
        notes: notes || `Statut changé en ${status}`
      })
    
    // Si annulation, libérer le créneau
    if (status === 'cancelled') {
      await supabase
        .from('time_slots')
        .update({ is_available: true })
        .eq('id', booking.time_slot_id)
    }
    
    return NextResponse.json({
      success: true,
      booking,
      message: 'Réservation mise à jour'
    })
    
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}