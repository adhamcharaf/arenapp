"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Calendar, MapPin, Clock, Phone, Mail, LogOut, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookingListSkeleton } from "@/components/common/LoadingStates"
import { useAuth } from "@/hooks/useAuth"
import { useBookings } from "@/hooks/useBookings"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils"
import type { Booking } from "@/types/database"

const statusConfig = {
  pending: { label: "En attente", variant: "secondary" as const },
  confirmed: { label: "Confirmée", variant: "success" as const },
  cancelled: { label: "Annulée", variant: "destructive" as const },
  completed: { label: "Terminée", variant: "outline" as const },
  no_show: { label: "Absent", variant: "destructive" as const }
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, authType, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Rediriger si non connecté
  useEffect(() => {
    if (!user) {
      router.push("/booking")
    }
  }, [user, router])

  // Charger les réservations
  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true)
      
      // Simuler le chargement des données
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Données fictives pour la démonstration
      const mockBookings: Booking[] = [
        {
          id: "1",
          user_id: user?.id || "",
          venue_id: "venue-1",
          time_slot_id: "slot-1",
          status: "confirmed",
          phone_number: "0700000000",
          total_amount: 15000,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
        },
        {
          id: "2",
          user_id: user?.id || "",
          venue_id: "venue-2",
          time_slot_id: "slot-2",
          status: "completed",
          phone_number: "0700000000",
          total_amount: 20000,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          venue: {
            id: "venue-2",
            name: "Urban Football Plateau",
            sport_type: "football",
            location: "Plateau, Abidjan",
            price_per_hour: 20000,
            created_at: new Date().toISOString()
          },
          time_slot: {
            id: "slot-2",
            venue_id: "venue-2",
            start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            is_available: false,
            created_at: new Date().toISOString()
          }
        }
      ]
      
      setBookings(mockBookings)
      setIsLoading(false)
    }

    if (user) {
      loadBookings()
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const upcomingBookings = bookings.filter(b => {
    const startTime = new Date(b.time_slot?.start_time || "")
    return startTime > new Date() && b.status !== "cancelled"
  })

  const pastBookings = bookings.filter(b => {
    const startTime = new Date(b.time_slot?.start_time || "")
    return startTime <= new Date() || b.status === "cancelled"
  })

  const displayedBookings = activeTab === "upcoming" ? upcomingBookings : pastBookings

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6 md:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Mon profil</h1>
          <p className="text-muted-foreground">
            Gérez vos réservations et vos informations personnelles
          </p>
        </div>

        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle>
                    {authType === "guest" ? "Invité" : user.email?.split("@")[0]}
                  </CardTitle>
                  <CardDescription>
                    {authType === "guest" ? (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        +225 {user.phone}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </CardHeader>
          {authType === "guest" && (
            <CardContent>
              <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Créer un compte</p>
                  <p className="text-sm text-muted-foreground">
                    Sauvegardez votre historique et accédez à plus de fonctionnalités
                  </p>
                </div>
                <Button variant="ci" size="sm">
                  S'inscrire
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Mes réservations</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={activeTab === "upcoming" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("upcoming")}
              >
                À venir ({upcomingBookings.length})
              </Button>
              <Button
                variant={activeTab === "past" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("past")}
              >
                Passées ({pastBookings.length})
              </Button>
            </div>

            {/* Bookings List */}
            {isLoading ? (
              <BookingListSkeleton />
            ) : displayedBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  {activeTab === "upcoming" 
                    ? "Aucune réservation à venir" 
                    : "Aucune réservation passée"}
                </p>
                {activeTab === "upcoming" && (
                  <Button onClick={() => router.push("/booking")}>
                    Réserver un terrain
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {displayedBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{booking.venue?.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {booking.venue?.location}
                          </p>
                        </div>
                        <Badge variant={statusConfig[booking.status].variant}>
                          {statusConfig[booking.status].label}
                        </Badge>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(booking.time_slot?.start_time || "")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {formatTime(booking.time_slot?.start_time || "")} - 
                            {formatTime(booking.time_slot?.end_time || "")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant={booking.venue?.sport_type === "padel" ? "ci" : "orange"}>
                            {booking.venue?.sport_type === "padel" ? "🎾 Padel" : "⚽ Football"}
                          </Badge>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Montant payé</p>
                          <p className="font-semibold">{formatCurrency(booking.total_amount)}</p>
                        </div>
                        
                        {booking.status === "confirmed" && new Date(booking.time_slot?.start_time || "") > new Date() && (
                          <Button variant="outline" size="sm">
                            Annuler
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}