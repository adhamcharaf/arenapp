'use client'

import { useState } from 'react'
import { useTimeSlots } from '@/hooks/useTimeSlots'
import { TimeSlot } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TimeSlotPickerProps {
  venueId: string
  onSelect: (slot: TimeSlot) => void
}

export default function TimeSlotPicker({ venueId, onSelect }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  const { slots, loading, error } = useTimeSlots(venueId, selectedDate)

  const availableSlots = slots.filter((s) => s.is_available)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
        />
      </div>

      {loading && <p>Chargement des créneaux...</p>}
      {error && <p className="text-red-600">Erreur: {error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {availableSlots.map((slot) => {
          const start = new Date(slot.start_time).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })
          const end = new Date(slot.end_time).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })
          return (
            <Button key={slot.id} variant="outline" size="sm" onClick={() => onSelect(slot)}>
              {start} - {end}
            </Button>
          )
        })}

        {!loading && availableSlots.length === 0 && (
          <p className="col-span-full text-gray-600 text-center">Aucun créneau disponible pour cette date.</p>
        )}
      </div>
    </div>
  )
}