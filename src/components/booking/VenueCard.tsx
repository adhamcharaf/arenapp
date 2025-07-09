'use client'

import { Venue } from '@/types/database'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface VenueCardProps {
  venue: Venue
  onSelect?: (venue: Venue) => void
}

export default function VenueCard({ venue, onSelect }: VenueCardProps) {
  const getVenueImage = () => {
    if (venue.sport_type === 'football') return '/football1.jpg'
    if (venue.sport_type === 'padel') return '/padel-banner.webp'
    return '/padel-banner.webp'
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden" onClick={() => onSelect?.(venue)}>
      <div className="relative h-48">
        <Image
          src={getVenueImage()}
          alt={`Terrain de ${venue.sport_type}`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-3 right-3 bg-ci-orange text-white px-3 py-1 rounded-full text-sm font-semibold">
          {Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(venue.price_per_hour)}
        </div>
      </div>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-700">{venue.location}</p>
        <p className="text-sm text-gray-500 line-clamp-2">{venue.description}</p>
        {onSelect && (
          <Button size="sm" variant="green" className="mt-2 w-full">Choisir ce terrain</Button>
        )}
      </CardContent>
    </Card>
  )
}