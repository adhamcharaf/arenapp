import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

// GET /api/payments/status - Récupérer le statut d'un paiement
export async function GET(request: NextRequest) {
  // Créer le client Supabase server-aware avec gestion des cookies
  const supabase = createSupabaseServerClient(request)
  
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('booking_id')
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID requis' },
        { status: 400 }
      )
    }
    
    console.log('🔍 Récupération statut paiement pour booking:', bookingId)
    
    // Récupérer le paiement depuis Supabase
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .single()
    
    if (error) {
      console.log('❌ Erreur récupération paiement:', error)
      
      // Si aucun paiement trouvé, retourner null au lieu d'une erreur
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          payment: null,
          message: 'Aucun paiement trouvé pour cette réservation'
        })
      }
      
      return NextResponse.json(
        { error: 'Erreur récupération paiement', details: error.message },
        { status: 500 }
      )
    }
    
    console.log('✅ Paiement trouvé:', payment.id, 'Status:', payment.status)
    
    return NextResponse.json({
      success: true,
      payment
    })
    
  } catch (error) {
    console.error('❌ Erreur API status paiement:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}