"use client"

import { MapPin, Users, Clock, Star } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type { Venue } from "@/types/database"

interface VenueCardProps {
  venue: Venue
  sportType: "padel" | "football"
  onSelect: (venue: Venue) => void
  isSelected?: boolean
}

export function VenueCard({ venue, sportType, onSelect, isSelected = false }: VenueCardProps) {
  const sportColors = {
    padel: "padel",
    football: "football"
  }

  const sportLabels = {
    padel: "Padel",
    football: "Football"
  }

  const fieldCount = venue.sport_type === sportType ? 1 : 0
  const hourlyRate = venue.price_per_hour

  if (venue.sport_type !== sportType) return null

  return (
    <Card 
      className={`transition-all cursor-pointer hover:shadow-lg ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => onSelect(venue)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{venue.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{venue.location}</span>
            </div>
          </div>
          <Badge variant={sportColors[sportType] as any}>
            {sportLabels[sportType]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {venue.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {venue.description}
          </p>
        )}

        {/* Features */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{fieldCount} terrain{fieldCount > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>7h - 22h</span>
          </div>
        </div>



        {/* Rating (placeholder) */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-1">(4.5)</span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(hourlyRate || 0)}
          </p>
          <p className="text-xs text-muted-foreground">par heure</p>
        </div>
        <Button 
          variant={isSelected ? "default" : "outline"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(venue)
          }}
        >
          {isSelected ? "Sélectionné" : "Sélectionner"}
        </Button>
      </CardFooter>
    </Card>
  )
}