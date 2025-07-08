import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { paymentSchema, validatePhone } from '@/utils/validation'

// Configuration Wave CI
const WAVE_CI_API_URL = process.env.WAVE_CI_API_URL || 'https://api.wave.com/v1'
const WAVE_CI_API_KEY = process.env.WAVE_CI_API_KEY

if (!WAVE_CI_API_KEY) {
  console.error('WAVE_CI_API_KEY non configurée')
}

// POST /api/payments/wave - Initier paiement Wave CI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = paymentSchema.parse(body)
    
    if (!WAVE_CI_API_KEY) {
      return NextResponse.json(
        { error: 'Configuration Wave CI manquante' },
        { status: 500 }
      )
    }
    
    const normalizedPhone = validatePhone(validatedData.phone_number)
    
    // Vérifier que la réservation existe
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, venue:venues(*)')
      .eq('id', validatedData.booking_id)
      .single()
    
    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      )
    }
    
    // Vérifier qu'il n'y a pas déjà un paiement en cours
    const { data: existingPayment, error: paymentError } = await supabase
      .from('payments')
      .select('id')
      .eq('booking_id', validatedData.booking_id)
      .in('status', ['pending', 'completed'])
      .single()
    
    if (existingPayment) {
      return NextResponse.json(
        { error: 'Paiement déjà en cours pour cette réservation' },
        { status: 409 }
      )
    }
    
    // Créer l'enregistrement de paiement
    const { data: payment, error: createError } = await supabase
      .from('payments')
      .insert({
        booking_id: validatedData.booking_id,
        provider: 'wave',
        amount: validatedData.amount,
        phone_number: normalizedPhone,
        status: 'pending'
      })
      .select()
      .single()
    
    if (createError) {
      return NextResponse.json(
        { error: 'Erreur création paiement', details: createError.message },
        { status: 500 }
      )
    }
    
    // Préparer la requête Wave CI
    const wavePayload = {
      amount: validatedData.amount,
      currency: 'XOF', // Franc CFA
      customer_phone: normalizedPhone,
      reference: `ARENAPP-${booking.id}`,
      description: `Réservation ${booking.venue.name} - ${booking.venue.sport_type}`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/wave/callback`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancelled`
    }
    
    try {
      // Appel API Wave CI
      const waveResponse = await fetch(`${WAVE_CI_API_URL}/checkout/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WAVE_CI_API_KEY}`
        },
        body: JSON.stringify(wavePayload)
      })
      
      const waveData = await waveResponse.json()
      
      if (!waveResponse.ok) {
        throw new Error(`Wave CI API error: ${waveData.message || 'Erreur inconnue'}`)
      }
      
      // Mettre à jour le paiement avec l'ID externe
      await supabase
        .from('payments')
        .update({
          external_ref: waveData.session_id,
          transaction_id: waveData.transaction_id
        })
        .eq('id', payment.id)
      
      return NextResponse.json({
        success: true,
        payment_id: payment.id,
        checkout_url: waveData.checkout_url,
        session_id: waveData.session_id,
        message: 'Paiement initié avec succès'
      })
      
    } catch (waveError) {
      console.error('Wave CI API error:', waveError)
      
      // Marquer le paiement comme échoué
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id)
      
      return NextResponse.json(
        { error: 'Erreur Wave CI', details: waveError instanceof Error ? waveError.message : 'Erreur inconnue' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Wave payment error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

// GET /api/payments/wave - Vérifier statut paiement Wave
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID requis' },
        { status: 400 }
      )
    }
    
    if (!WAVE_CI_API_KEY) {
      return NextResponse.json(
        { error: 'Configuration Wave CI manquante' },
        { status: 500 }
      )
    }
    
    try {
      // Vérifier le statut chez Wave CI
      const waveResponse = await fetch(`${WAVE_CI_API_URL}/checkout/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${WAVE_CI_API_KEY}`
        }
      })
      
      const waveData = await waveResponse.json()
      
      if (!waveResponse.ok) {
        throw new Error(`Wave CI API error: ${waveData.message}`)
      }
      
      // Mettre à jour le paiement local
      const { data: payment, error } = await supabase
        .from('payments')
        .update({
          status: waveData.status === 'completed' ? 'completed' : 'pending',
          transaction_id: waveData.transaction_id
        })
        .eq('external_ref', sessionId)
        .select('*, booking:bookings(*)')
        .single()
      
      if (error) {
        console.error('Update payment error:', error)
      }
      
      // Si paiement réussi, confirmer la réservation
      if (waveData.status === 'completed' && payment) {
        await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', payment.booking_id)
        
        await supabase
          .from('booking_history')
          .insert({
            booking_id: payment.booking_id,
            action: 'PAYMENT_COMPLETED',
            notes: `Paiement Wave CI réussi - ${waveData.transaction_id}`
          })
      }
      
      return NextResponse.json({
        success: true,
        status: waveData.status,
        payment,
        transaction_id: waveData.transaction_id
      })
      
    } catch (waveError) {
      console.error('Wave CI status check error:', waveError)
      return NextResponse.json(
        { error: 'Erreur vérification Wave CI' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Wave status check error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}