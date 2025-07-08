"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { ArrowLeft, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VenueCard } from "@/components/booking/VenueCard"
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker"
import { BookingForm } from "@/components/booking/BookingForm"
import { AuthProvider } from "@/components/auth/AuthProvider"
import { LoadingScreen, VenueCardSkeleton } from "@/components/common/LoadingStates"
import { useAuth } from "@/hooks/useAuth"
import type { Venue, TimeSlot, SportType } from "@/types/database"

// Composant interne pour gérer les paramètres de recherche
function BookingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const [step, setStep] = useState<"venue" | "timeslot" | "auth" | "confirm">("venue")
  const [sportType, setSportType] = useState<SportType>("padel")
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Récupérer le sport depuis l'URL
  useEffect(() => {
    const sport = searchParams.get("sport") as SportType
    if (sport && (sport === "padel" || sport === "football")) {
      setSportType(sport)
    }
  }, [searchParams])

  // Charger les terrains
  useEffect(() => {
    const loadVenues = async () => {
      setIsLoading(true)
      
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Données fictives pour la démonstration
      const mockVenues: Venue[] = [
        {
          id: "1",
          name: "Complexe Sportif Riviera",
          sport_type: "padel",
          location: "Riviera Golf, Abidjan",
          price_per_hour: 15000,
          description: "Complexe moderne avec 4 terrains de padel",
          created_at: new Date().toISOString()
        },
        {
          id: "2",
          name: "Padel Club Marcory",
          sport_type: "padel",
          location: "Marcory Zone 4, Abidjan",
          price_per_hour: 12000,
          description: "2 terrains couverts, éclairage LED",
          created_at: new Date().toISOString()
        },
        {
          id: "3",
          name: "Urban Football Plateau",
          sport_type: "football",
          location: "Plateau, Abidjan",
          price_per_hour: 25000,
          description: "Terrain 5v5 synthétique dernière génération",
          created_at: new Date().toISOString()
        },
        {
          id: "4",
          name: "Soccer Arena Yopougon",
          sport_type: "football",
          location: "Yopougon Ananeraie, Abidjan",
          price_per_hour: 20000,
          description: "2 terrains 7v7, vestiaires modernes",
          created_at: new Date().toISOString()
        }
      ]
      
      setVenues(mockVenues)
      setIsLoading(false)
    }

    loadVenues()
  }, [])

  const handleVenueSelect = (venue: Venue) => {
    setSelectedVenue(venue)
    setStep("timeslot")
  }

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot)
    
    // Si l'utilisateur est connecté, aller directement à la confirmation
    if (user) {
      setStep("confirm")
    } else {
      setStep("auth")
    }
  }

  const handleAuthSuccess = () => {
    setStep("confirm")
  }

  const handleBack = () => {
    if (step === "timeslot") {
      setStep("venue")
      setSelectedTimeSlot(null)
    } else if (step === "auth") {
      setStep("timeslot")
    } else if (step === "confirm") {
      if (!user) {
        setStep("auth")
      } else {
        setStep("timeslot")
      }
    }
  }

  const getSportLabel = () => {
    return sportType === "padel" ? "Padel" : "Football"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {step !== "venue" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Réserver un terrain de {getSportLabel()}
              </h1>
              <p className="text-muted-foreground">
                {step === "venue" && "Sélectionnez votre terrain"}
                {step === "timeslot" && "Choisissez votre créneau"}
                {step === "auth" && "Connectez-vous pour continuer"}
                {step === "confirm" && "Finalisez votre réservation"}
              </p>
            </div>
          </div>

          {/* Sport toggle */}
          {step === "venue" && (
            <div className="flex gap-2">
              <Button
                variant={sportType === "padel" ? "default" : "outline"}
                onClick={() => setSportType("padel")}
                className="hidden sm:flex"
              >
                🎾 Padel
              </Button>
              <Button
                variant={sportType === "football" ? "default" : "outline"}
                onClick={() => setSportType("football")}
                className="hidden sm:flex"
              >
                ⚽ Football
              </Button>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto">
          <div className={`flex items-center gap-2 text-sm ${step === "venue" ? "text-primary font-medium" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "venue" ? "bg-primary text-white" : "bg-muted"}`}>
              1
            </div>
            <span className="whitespace-nowrap">Terrain</span>
          </div>
          <div className="w-8 h-px bg-border" />
          <div className={`flex items-center gap-2 text-sm ${step === "timeslot" ? "text-primary font-medium" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "timeslot" ? "bg-primary text-white" : "bg-muted"}`}>
              2
            </div>
            <span className="whitespace-nowrap">Créneau</span>
          </div>
          <div className="w-8 h-px bg-border" />
          <div className={`flex items-center gap-2 text-sm ${step === "auth" ? "text-primary font-medium" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "auth" ? "bg-primary text-white" : "bg-muted"}`}>
              3
            </div>
            <span className="whitespace-nowrap">Connexion</span>
          </div>
          <div className="w-8 h-px bg-border" />
          <div className={`flex items-center gap-2 text-sm ${step === "confirm" ? "text-primary font-medium" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "confirm" ? "bg-primary text-white" : "bg-muted"}`}>
              4
            </div>
            <span className="whitespace-nowrap">Confirmation</span>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {/* Step 1: Venue Selection */}
          {step === "venue" && (
            <>
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <VenueCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {venues
                    .filter(venue => venue.sport_type === sportType)
                    .map((venue) => (
                      <VenueCard
                        key={venue.id}
                        venue={venue}
                        sportType={sportType}
                        onSelect={handleVenueSelect}
                      />
                    ))}
                </div>
              )}
              {!isLoading && venues.filter(v => v.sport_type === sportType).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Aucun terrain de {getSportLabel()} disponible pour le moment
                  </p>
                </div>
              )}
            </>
          )}

          {/* Step 2: Time Slot Selection */}
          {step === "timeslot" && selectedVenue && (
            <div className="max-w-3xl mx-auto">
              <TimeSlotPicker
                venueId={selectedVenue.id}
                onSelect={handleTimeSlotSelect}
                selectedSlot={selectedTimeSlot}
              />
            </div>
          )}

          {/* Step 3: Authentication */}
          {step === "auth" && (
            <div className="max-w-md mx-auto">
              <AuthProvider
                defaultMode="guest"
                onSuccess={handleAuthSuccess}
              />
            </div>
          )}

          {/* Step 4: Booking Confirmation */}
          {step === "confirm" && selectedVenue && selectedTimeSlot && (
            <div className="max-w-2xl mx-auto">
              <BookingForm
                venue={selectedVenue}
                timeSlot={selectedTimeSlot}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Page principale avec Suspense pour useSearchParams
export default function BookingPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <BookingContent />
    </Suspense>
  )
}