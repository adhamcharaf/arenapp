"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, Trophy, Clock, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const sports = [
  {
    id: "padel",
    name: "Padel",
    description: "Le sport de raquette le plus tendance",
    features: ["4 joueurs", "Terrain vitré", "45 min - 1h30"],
    color: "bg-sport-padel",
    icon: "🎾"
  },
  {
    id: "football",
    name: "Football",
    description: "Le sport roi, en petit comité",
    features: ["10-14 joueurs", "Gazon synthétique", "1h - 2h"],
    color: "bg-sport-football",
    icon: "⚽"
  }
]

const features = [
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Réservation rapide",
    description: "Réservez votre créneau en quelques clics"
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Paiement sécurisé",
    description: "Via Wave Money, Orange Money ou MTN"
  },
  {
    icon: <Trophy className="h-6 w-6" />,
    title: "Meilleurs terrains",
    description: "Sélection des meilleurs complexes d'Abidjan"
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Mode invité",
    description: "Pas besoin de créer un compte pour réserver"
  }
]

export default function HomePage() {
  const router = useRouter()

  const handleSportSelect = (sportId: string) => {
    router.push(`/booking?sport=${sportId}`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background">
        <div className="container py-12 md:py-24">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="ci" className="mb-4">
              🚀 Nouveau à Abidjan
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold">
              Réservez vos terrains de sport
              <span className="text-primary block mt-2">en quelques clics</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              La première plateforme de réservation de terrains sportifs en Côte d'Ivoire. 
              Padel, football et bien plus encore.
            </p>
          </div>
        </div>
      </section>

      {/* Sport Selection */}
      <section className="container py-12 md:py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Choisissez votre sport
          </h2>
          <p className="text-muted-foreground">
            Sélectionnez le sport que vous souhaitez pratiquer
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {sports.map((sport) => (
            <Card 
              key={sport.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
              onClick={() => handleSportSelect(sport.id)}
            >
              <CardHeader>
                <div className={`w-16 h-16 rounded-full ${sport.color} flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{sport.icon}</span>
                </div>
                <CardTitle className="text-2xl">{sport.name}</CardTitle>
                <CardDescription>{sport.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {sport.features.map((feature, index) => (
                    <Badge key={index} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <Button className="w-full" variant={sport.id === "padel" ? "padel" : "football"}>
                  Réserver un terrain
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/50 py-12 md:py-16">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Pourquoi ARENAPP ?
            </h2>
            <p className="text-muted-foreground">
              La solution complète pour vos réservations sportives
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  {feature.icon}
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-12 md:py-16">
        <div className="bg-gradient-to-r from-ci-green to-ci-orange rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Prêt à jouer ?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Rejoignez des milliers de sportifs à Abidjan
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push("/booking")}
            className="font-semibold"
          >
            Commencer maintenant
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t py-8">
        <div className="container">
          <div className="grid grid-cols-3 gap-4 text-center max-w-3xl mx-auto">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">15+</p>
              <p className="text-sm text-muted-foreground">Terrains partenaires</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Réservations/mois</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-primary">4.8⭐</p>
              <p className="text-sm text-muted-foreground">Note moyenne</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
