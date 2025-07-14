import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

// POST /api/payments/wave/callback - Webhook Wave CI
export async function POST(request: NextRequest) {
  // Créer le client Supabase server-aware avec gestion des cookies
  const supabase = createSupabaseServerClient(request)
  
  try {
    const body = await request.json()
    console.log('Wave CI callback received:', body)
    
    const { session_id, status, transaction_id } = body
    
    if (!session_id || !status) {
      return NextResponse.json(
        { error: 'Données callback invalides' },
        { status: 400 }
      )
    }
    
    // Trouver le paiement correspondant
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*, booking:bookings(*)')
      .eq('external_ref', session_id)
      .single()
    
    if (findError || !payment) {
      console.error('Payment not found for session:', session_id)
      return NextResponse.json(
        { error: 'Paiement non trouvé' },
        { status: 404 }
      )
    }
    
    // Mettre à jour le statut du paiement
    let paymentStatus: import('@/types/database').PaymentStatus = 'pending'
    
    switch (status) {
      case 'completed':
      case 'success':
        paymentStatus = 'completed'
        break
      case 'failed':
      case 'cancelled':
        paymentStatus = 'failed'
        break
      default:
        paymentStatus = 'pending'
    }
    
    // Mettre à jour le paiement
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        transaction_id: transaction_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id)
    
    if (updateError) {
      console.error('Failed to update payment:', updateError)
      return NextResponse.json(
        { error: 'Erreur mise à jour paiement' },
        { status: 500 }
      )
    }
    
    // Si paiement réussi, confirmer la réservation
    if (paymentStatus === 'completed') {
      await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', payment.booking_id)
      
      await supabase
        .from('booking_history')
        .insert({
          booking_id: payment.booking_id,
          action: 'PAYMENT_COMPLETED',
          notes: `Paiement Wave CI confirmé - Transaction: ${transaction_id}`
        })
      
      console.log(`Payment completed for booking ${payment.booking_id}`)
    }
    
    // Si paiement échoué, libérer le créneau
    if (paymentStatus === 'failed') {
      await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', payment.booking_id)
      
      // Libérer le créneau
      await supabase
        .from('time_slots')
        .update({ is_available: true })
        .eq('id', payment.booking.time_slot_id)
      
      await supabase
        .from('booking_history')
        .insert({
          booking_id: payment.booking_id,
          action: 'PAYMENT_FAILED',
          notes: `Paiement Wave CI échoué - Transaction: ${transaction_id}`
        })
      
      console.log(`Payment failed for booking ${payment.booking_id}`)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Callback traité avec succès'
    })
    
  } catch (error) {
    console.error('Wave callback error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// GET /api/payments/wave/callback - Pour tester le callback
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    message: 'Wave CI callback endpoint',
    status: 'active'
  })
}