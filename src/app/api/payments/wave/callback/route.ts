// PAYMENT_DISABLED: Webhook Wave CI temporairement désactivé pour les tests
// Pour réactiver: restaurer le code original depuis le backup

import { NextRequest, NextResponse } from 'next/server'

// POST /api/payments/wave/callback - Version mock pour les tests
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Webhooks temporairement désactivés',
      message: 'Mode test activé - Callbacks non traités',
      mock_mode: true
    },
    { status: 503 }
  )
}

// GET /api/payments/wave/callback - Version mock pour les tests
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Wave CI callback endpoint (Mode Test)',
    status: 'disabled',
    mock_mode: true
  })
}

/*
// PAYMENT_DISABLED: Code callback Wave CI original (sauvegardé pour réactivation)
// TODO: Restaurer ce code quand les paiements seront réactivés

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/payments/wave/callback - Webhook Wave CI
export async function POST(request: NextRequest) {
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

*/