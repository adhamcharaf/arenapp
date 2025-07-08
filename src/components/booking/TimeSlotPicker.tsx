"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatTime, cn } from "@/lib/utils"
import { TimeSlotsSkeleton } from "@/components/common/LoadingStates"
import type { TimeSlot } from "@/types/database"

interface TimeSlotPickerProps {
  venueId: string
  onSelect: (timeSlot: TimeSlot) => void
  selectedSlot?: TimeSlot | null
}

export function TimeSlotPicker({ venueId, onSelect, selectedSlot }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Générer les 7 prochains jours
  const getNextDays = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }

  const days = getNextDays()

  // Simuler le chargement des créneaux
  useEffect(() => {
    const loadTimeSlots = async () => {
      setIsLoading(true)
      
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Générer des créneaux fictifs pour la démonstration
      const slots: TimeSlot[] = []
      const startHour = 7
      const endHour = 22
      
      for (let hour = startHour; hour < endHour; hour++) {
        const startTime = new Date(selectedDate)
        startTime.setHours(hour, 0, 0, 0)
        
        const endTime = new Date(selectedDate)
        endTime.setHours(hour + 1, 0, 0, 0)
        
        // Rendre certains créneaux indisponibles aléatoirement
        const isAvailable = Math.random() > 0.3
        
        slots.push({
          id: `slot-${hour}`,
          venue_id: venueId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          is_available: isAvailable,
          created_at: new Date().toISOString()
        })
      }
      
      setTimeSlots(slots)
      setIsLoading(false)
    }

    loadTimeSlots()
  }, [selectedDate, venueId])

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1))
    
    // Ne pas permettre de naviguer dans le passé
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (newDate >= today) {
      setSelectedDate(newDate)
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPastTime = (slot: TimeSlot) => {
    return new Date(slot.start_time) < new Date()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Sélectionner un créneau
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date selector */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate('prev')}
            disabled={isToday(selectedDate)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {days.map((day) => {
                const isSelected = day.toDateString() === selectedDate.toDateString()
                const dayName = new Intl.DateTimeFormat('fr-CI', { weekday: 'short' }).format(day)
                const dayNumber = day.getDate()
                
                return (
                  <Button
                    key={day.toISOString()}
                    variant={isSelected ? "default" : "outline"}
                    className="min-w-[80px] flex-col h-auto py-2"
                    onClick={() => setSelectedDate(day)}
                  >
                    <span className="text-xs uppercase">{dayName}</span>
                    <span className="text-lg font-bold">{dayNumber}</span>
                  </Button>
                )
              })}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected date display */}
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">
            Créneaux disponibles pour le
          </p>
          <p className="font-semibold">{formatDate(selectedDate)}</p>
        </div>

        {/* Time slots */}
        {isLoading ? (
          <TimeSlotsSkeleton />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {timeSlots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id
              const isPast = isPastTime(slot)
              const isDisabled = !slot.is_available || isPast
              
              return (
                <Button
                  key={slot.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  disabled={isDisabled}
                  onClick={() => onSelect(slot)}
                  className={cn(
                    "h-12 flex-col",
                    isDisabled && "opacity-50 cursor-not-allowed",
                    isSelected && "ring-2 ring-primary"
                  )}
                >
                  <span className="text-xs">
                    {formatTime(slot.start_time)}
                  </span>
                  {!slot.is_available && !isPast && (
                    <Badge variant="destructive" className="text-xs mt-1">
                      Complet
                    </Badge>
                  )}
                  {isPast && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      Passé
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>
        )}

        {/* No slots message */}
        {!isLoading && timeSlots.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun créneau disponible pour cette date
          </div>
        )}
      </CardContent>
    </Card>
  )
}