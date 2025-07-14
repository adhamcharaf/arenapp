'use client'

import React, { useState, type ChangeEvent } from 'react'
import { useTimeSlots } from '@/hooks/useTimeSlots'
import { TimeSlot } from '@/types/database'
import { LoadingSpinner } from '@/components/common/LoadingStates'
import { Input } from '@/components/ui/input'
import { isPastTimeSlot, formatSlotTime } from '@/utils/dateUtils'

// Helper to get slot card classes based on availability / past
const getSlotClasses = (slot: TimeSlot) => {
  const isPast = isPastTimeSlot(slot.start_time)
  const isUnavailable = !slot.is_available || isPast

  if (isUnavailable) {
    return 'bg-gray-200 text-gray-500 p-3 rounded-lg cursor-not-allowed border-2 border-gray-300 slot-disabled'
  }

  return 'bg-ci-green text-white p-3 rounded-lg cursor-pointer hover:bg-ci-green/90 border-2 border-transparent slot-available'
}

interface TimeSlotPickerProps {
  venueId: string
  onSelect: (slot: TimeSlot) => void
  shouldRefresh?: boolean
  onRefreshComplete?: () => void
}

export default function TimeSlotPicker({ venueId, onSelect, shouldRefresh, onRefreshComplete }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null)

  const { slots, loading, error, refreshSlots } = useTimeSlots(venueId, selectedDate)


  // Watch for shouldRefresh prop changes to trigger refresh
  React.useEffect(() => {
    if (shouldRefresh) {
      setBookingSlotId(null)
      refreshSlots()
      onRefreshComplete?.()
    }
  }, [shouldRefresh, refreshSlots, onRefreshComplete])

  // On affiche tous les créneaux, le style sera déterminé par la fonction ci-dessus

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
        />
      </div>

      {loading && <div className="flex justify-center"><LoadingSpinner /></div>}
      {error && <p className="text-red-600">Erreur: {error}</p>}

      {/* Légende disponible / occupé */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-ci-green rounded" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <span>Occupé</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {slots.map((slot) => {
          const start = formatSlotTime(slot.start_time)
          const end = formatSlotTime(slot.end_time)

          const isPast = isPastTimeSlot(slot.start_time)
          const isUnavailable = !slot.is_available || isPast
          const isBookingInProgress = bookingSlotId === slot.id


          return (
            <div
              key={slot.id}
              className={getSlotClasses(slot)}
              onClick={() => {
                if (isUnavailable || isBookingInProgress) return
                setBookingSlotId(slot.id)
                onSelect(slot)
              }}
            >
              <div className="font-medium">{start} - {end}</div>
              <div className="text-sm opacity-90 flex items-center gap-1">
                {isBookingInProgress && (
                  <div className="w-4 h-4">
                    <LoadingSpinner />
                  </div>
                )}
                {isBookingInProgress ? 'Réservation...' : (isUnavailable ? 'Occupé' : 'Libre')}
              </div>
            </div>
          )
        })}

        {!loading && slots.length === 0 && (
          <p className="col-span-full text-gray-600 text-center">Aucun créneau disponible pour cette date.</p>
        )}
      </div>
    </div>
  )
}