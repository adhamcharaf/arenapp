"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentMethods } from "@/components/payment/PaymentMethods"
import { WavePayment } from "@/components/payment/WavePayment"
import { LoadingScreen } from "@/components/common/LoadingStates"
import { useBookings } from "@/hooks/useBookings"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils"
import type { Booking } from "@/types/database"

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get("booking")
  
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentComplete, setPaymentComplete] = useState(false)

  // Charger les détails de la réservation
  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) {
        router.push("/booking")
        return
      }

      setIsLoading(true)
      
      // Simuler le chargement des données
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Données fictives pour la démonstration
      const mockBooking: Booking = {
        id: bookingId,
        user_id: "user-123",
        venue_id: "venue-1",
        time_slot_id: "slot-1",
        status: "pending",
        phone_number: "0700000000",
        total_amount: 15000,
        created_at: new Date().toISOString(),
        venue: {
          id: "venue-1",
          name: "Complexe Sportif Riviera",
          sport_type: "padel",
          location: "Riviera Golf, Abidjan",
          price_per_hour: 15000,
          created_at: new Date().toISOString()
        },
        time_slot: {
          id: "slot-1",
          venue_id: "venue-1",
          start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
          is_available: false,
          created_at: new Date().toISOString()
        }
      }
      
      setBooking(mockBooking)
      setIsLoading(false)
    }

    loadBooking()
  }, [bookingId, router])

  const handlePaymentSuccess = () => {
    setPaymentComplete(true)
    // Rediriger vers la page de confirmation après 3 secondes
    setTimeout(() => {
      router.push("/profile")
    }, 3000)
  }

  const handleCashPayment = () => {
    // Pour le paiement en espèces, on confirme directement
    setPaymentComplete(true)
    setTimeout(() => {
      router.push("/profile")
    }, 3000)
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!booking) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Réservation non trouvée</p>
        <Button onClick={() => router.push("/booking")} className="mt-4">
          Retour aux réservations
        </Button>
      </div>
    )
  }

  // Écran de succès
  if (paymentComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <CheckCircle2 className="h-20 w-20 mx-auto mb-6 text-green-500" />
          <h1 className="text-3xl font-bold mb-2">Réservation confirmée!</h1>
          <p className="text-muted-foreground mb-6">
            Votre terrain est réservé. Vous recevrez un SMS de confirmation.
          </p>
          
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Terrain:</span>
                  <span className="font-medium">{booking.venue?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{formatDate(booking.time_slot?.start_time || "")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Heure:</span>
                  <span className="font-medium">
                    {formatTime(booking.time_slot?.start_time || "")} - {formatTime(booking.time_slot?.end_time || "")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground">
            Redirection vers vos réservations...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Paiement</h1>
            <p className="text-muted-foreground">
              Finalisez votre réservation
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Résumé de la réservation */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{booking.venue?.name}</p>
                  <p className="text-sm text-muted-foreground">{booking.venue?.location}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Date:</span>{" "}
                    {formatDate(booking.time_slot?.start_time || "")}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Heure:</span>{" "}
                    {formatTime(booking.time_slot?.start_time || "")} - {formatTime(booking.time_slot?.end_time || "")}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total à payer</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(booking.total_amount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Méthodes de paiement */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {!selectedMethod ? (
              <PaymentMethods
                selectedMethod={selectedMethod}
                onSelect={(method) => {
                  if (method === "cash") {
                    handleCashPayment()
                  } else {
                    setSelectedMethod(method)
                  }
                }}
                amount={booking.total_amount}
              />
            ) : (
              <>
                {selectedMethod === "wave" && (
                  <WavePayment
                    bookingId={booking.id}
                    amount={booking.total_amount}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setSelectedMethod(null)}
                  />
                )}
                
                {/* Ajouter ici les autres méthodes de paiement */}
                {(selectedMethod === "orange" || selectedMethod === "mtn") && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground mb-4">
                        Le paiement {selectedMethod === "orange" ? "Orange Money" : "MTN Mobile Money"} sera bientôt disponible
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedMethod(null)}
                      >
                        Choisir une autre méthode
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PaymentContent />
    </Suspense>
  )
}