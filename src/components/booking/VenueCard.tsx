'use client'

import { Venue } from '@/types/database'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface VenueCardProps {
  venue: Venue
  onSelect?: (venue: Venue) => void
}

export default function VenueCard({ venue, onSelect }: VenueCardProps) {
  return (
    <Card className="hover:shadow-md transition cursor-pointer" onClick={() => onSelect?.(venue)}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 flex-1">{venue.name}</h3>
        <span className="text-sm text-gray-500">{Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(venue.price_per_hour)}</span>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-700">{venue.location}</p>
        <p className="text-sm text-gray-500 line-clamp-2">{venue.description}</p>
        {onSelect && (
          <Button size="sm" className="mt-2">Choisir</Button>
        )}
      </CardContent>
    </Card>
  )
}