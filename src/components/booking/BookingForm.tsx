"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Phone, Mail, MessageSquare, Calendar, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { useBookings } from "@/hooks/useBookings"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils"
import { Spinner } from "@/components/common/LoadingStates"
import { PHONE_REGEX } from "@/utils/constants"
import type { Venue, TimeSlot } from "@/types/database"

interface BookingFormProps {
  venue: Venue
  timeSlot: TimeSlot
  onSuccess?: () => void
}

export function BookingForm({ venue, timeSlot, onSuccess }: BookingFormProps) {
  const router = useRouter()
  const { user, authType } = useAuth()
  const { createBooking } = useBookings()
  
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState(user?.email || "")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const limited = cleaned.slice(0, 10)
    
    if (limited.length <= 2) return limited
    if (limited.length <= 4) return `${limited.slice(0, 2)} ${limited.slice(2)}`
    if (limited.length <= 6) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4)}`
    if (limited.length <= 8) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6)}`
    return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6, 8)} ${limited.slice(8)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation du téléphone
    const cleanPhone = phoneNumber.replace(/\D/g, "")
    if (!PHONE_REGEX.test(cleanPhone)) {
      setError("Numéro de téléphone invalide")
      return
    }

    setIsLoading(true)

    try {
      const booking = await createBooking({
        venue_id: venue.id,
        time_slot_id: timeSlot.id,
        phone_number: cleanPhone,
        notes: notes.trim() || undefined,
      })

      if (!booking) {
        setError("Une erreur est survenue lors de la réservation")
      } else {
        // Rediriger vers la page de paiement avec l'ID de la réservation
        router.push(`/payment?booking=${booking.id}`)
      }
    } catch (err) {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Confirmer votre réservation</CardTitle>
        <CardDescription>
          Vérifiez les détails et complétez vos informations
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Résumé de la réservation */}
          <div className="space-y-4">
            <h3 className="font-semibold">Détails de la réservation</h3>
            
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{venue.name}</p>
                  <p className="text-sm text-muted-foreground">{venue.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm">{formatDate(timeSlot.start_time)}</p>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm">
                  {formatTime(timeSlot.start_time)} - {formatTime(timeSlot.end_time)}
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-medium">Total à payer</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(venue.price_per_hour)}
                </span>
              </div>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Informations de contact</h3>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <div className="absolute left-10 top-3 text-sm text-muted-foreground">+225</div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="07 00 00 00 00"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="pl-20"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Nous vous enverrons un SMS de confirmation
              </p>
            </div>

            {authType === 'account' && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    className="pl-10"
                    disabled
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  id="notes"
                  placeholder="Instructions spéciales, nombre de joueurs..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Informations importantes */}
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="font-medium text-sm">Informations importantes</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• La réservation est valable pour 1 heure</li>
              <li>• Présentez-vous 10 minutes avant votre créneau</li>
              <li>• En cas d'annulation, prévenez au moins 2h à l'avance</li>
              <li>• Le paiement se fait directement sur place ou via Wave</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Retour
            </Button>
            
            <Button
              type="submit"
              variant="ci"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Réservation...
                </>
              ) : (
                "Continuer vers le paiement"
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            En continuant, vous acceptez nos conditions d'utilisation
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}