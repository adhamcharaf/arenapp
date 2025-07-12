// API Mock pour confirmer automatiquement les réservations en mode test

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/bookings/confirm - Confirmer une réservation (Mode Test)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { booking_id } = body
    
    if (!booking_id) {
      return NextResponse.json(
        { error: 'ID de réservation requis' },
        { status: 400 }
      )
    }
    
    // Vérifier que la réservation existe
    const { data: booking, error: findError } = await supabase
      .from('bookings')
      .select('*, venue:venues(*), time_slot:time_slots(*)')
      .eq('id', booking_id)
      .single()
    
    if (findError || !booking) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      )
    }
    
    // Confirmer la réservation
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', booking_id)
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Erreur lors de la confirmation' },
        { status: 500 }
      )
    }
    
    // Créer un faux paiement confirmé pour l'historique
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: booking_id,
        provider: 'wave',
        amount: booking.total_amount,
        phone_number: booking.phone_number,
        status: 'completed',
        transaction_id: `mock_${Date.now()}`,
        external_ref: `test_${booking_id}`
      })
    
    if (paymentError) {
      console.warn('Erreur création paiement mock:', paymentError)
    }
    
    // Ajouter à l'historique
    await supabase
      .from('booking_history')
      .insert({
        booking_id: booking_id,
        action: 'PAYMENT_COMPLETED',
        notes: 'Paiement confirmé automatiquement (Mode Test)'
      })
    
    return NextResponse.json({
      success: true,
      message: 'Réservation confirmée avec succès',
      booking_id: booking_id,
      status: 'confirmed',
      mock_mode: true
    })
    
  } catch (error) {
    console.error('Erreur confirmation réservation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}