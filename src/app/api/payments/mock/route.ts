import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { paymentSchema } from '@/utils/validation'

// POST /api/payments/mock - Créer un paiement mock pour les tests
export async function POST(request: NextRequest) {
  // Créer le client Supabase server-aware avec gestion des cookies
  const supabase = createSupabaseServerClient(request)
  
  try {
    const body = await request.json()
    console.log('🧪 Création paiement mock - Données reçues:', body)
    
    // Validation des données
    const validatedData = paymentSchema.parse(body)
    
    // Vérifier que la réservation existe
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, venue:venues(*)')
      .eq('id', validatedData.booking_id)
      .single()
    
    if (bookingError || !booking) {
      console.log('❌ Réservation non trouvée:', bookingError)
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      )
    }
    
    // Créer l'enregistrement de paiement mock
    const { data: payment, error: createError } = await supabase
      .from('payments')
      .insert({
        booking_id: validatedData.booking_id,
        provider: validatedData.provider || 'wave',
        amount: validatedData.amount,
        phone_number: body.phone_number,
        status: body.status || 'completed',
        external_ref: body.external_ref || `mock-session-${Date.now()}`,
        transaction_id: body.transaction_id || `mock-tx-${Date.now()}`
      })
      .select()
      .single()
    
    if (createError) {
      console.log('❌ Erreur création paiement mock:', createError)
      return NextResponse.json(
        { error: 'Erreur création paiement mock', details: createError.message },
        { status: 500 }
      )
    }
    
    // Mettre à jour la réservation en confirmed
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', validatedData.booking_id)
    
    if (updateError) {
      console.log('⚠️ Erreur mise à jour réservation:', updateError)
      // Continue malgré l'erreur
    }
    
    // Ajouter une entrée dans l'historique
    await supabase
      .from('booking_history')
      .insert({
        booking_id: validatedData.booking_id,
        action: 'PAYMENT_COMPLETED',
        notes: `Paiement mock simulé - ${payment.transaction_id}`
      })
    
    console.log('✅ Paiement mock créé avec succès:', payment.id)
    
    return NextResponse.json({
      success: true,
      payment_id: payment.id,
      session_id: payment.external_ref,
      transaction_id: payment.transaction_id,
      message: 'Paiement mock créé avec succès (Mode Test)',
      mock: true
    })
    
  } catch (error) {
    console.error('❌ Erreur paiement mock:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

// GET /api/payments/mock - Endpoint de test
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    message: 'Mock payment endpoint',
    status: 'active',
    mode: 'test'
  })
}