import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bookingSchema, validatePhone } from '@/utils/validation'

// GET /api/bookings - Récupérer les réservations
export async function GET(request: NextRequest) {
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
  try {
    const body = await request.json()
    const validatedData = bookingSchema.parse(body)
    
    const normalizedPhone = validatePhone(validatedData.phone_number)
    
    // Vérifier la disponibilité du créneau
    const { data: timeSlot, error: slotError } = await supabase
      .from('time_slots')
      .select('*, venue:venues(*)')
      .eq('id', validatedData.time_slot_id)
      .eq('is_available', true)
      .single()
    
    if (slotError || !timeSlot) {
      return NextResponse.json(
        { error: 'Créneau non disponible' },
        { status: 400 }
      )
    }
    
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
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      userId = session.user.id
    } else {
      // Utilisateur invité - créer ou récupérer
      const { data: guestUser, error: guestError } = await supabase
        .from('users')
        .select('id')
        .eq('phone', normalizedPhone)
        .eq('auth_type', 'guest')
        .single()
      
      if (guestError && guestError.code !== 'PGRST116') {
        return NextResponse.json(
          { error: 'Erreur utilisateur invité', details: guestError.message },
          { status: 500 }
        )
      }
      
      if (!guestUser) {
        const { data: newGuest, error: createError } = await supabase
          .from('users')
          .insert({
            phone: normalizedPhone,
            auth_type: 'guest'
          })
          .select('id')
          .single()
        
        if (createError) {
          return NextResponse.json(
            { error: 'Erreur création utilisateur', details: createError.message },
            { status: 500 }
          )
        }
        
        userId = newGuest.id
      } else {
        userId = guestUser.id
      }
    }
    
    // Créer la réservation
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        venue_id: validatedData.venue_id,
        time_slot_id: validatedData.time_slot_id,
        phone_number: normalizedPhone,
        total_amount: timeSlot.venue.price_per_hour,
        notes: validatedData.notes,
        status: 'pending'
      })
      .select(`
        *,
        user:users(*),
        venue:venues(*),
        time_slot:time_slots(*)
      `)
      .single()
    
    if (bookingError) {
      return NextResponse.json(
        { error: 'Erreur création réservation', details: bookingError.message },
        { status: 500 }
      )
    }
    
    // Marquer le créneau comme non disponible
    await supabase
      .from('time_slots')
      .update({ is_available: false })
      .eq('id', validatedData.time_slot_id)
    
    // Créer entrée dans l'historique
    await supabase
      .from('booking_history')
      .insert({
        booking_id: booking.id,
        action: 'CREATED',
        notes: 'Réservation créée'
      })
    
    return NextResponse.json({
      success: true,
      booking,
      message: 'Réservation créée avec succès'
    })
    
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

// PUT /api/bookings - Mettre à jour une réservation
export async function PUT(request: NextRequest) {
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