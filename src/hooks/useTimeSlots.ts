import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TimeSlot } from '@/types/database'

export function useTimeSlots(venueId?: string, date?: string) {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!venueId || !date) return

    const fetchSlots = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('venue_id', venueId)
        .gte('start_time', `${date} 00:00:00`)
        .lte('end_time', `${date} 23:59:59`)
        .order('start_time', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setSlots(data as TimeSlot[])
      }
      setLoading(false)
    }

    fetchSlots()
  }, [venueId, date])

  return { slots, loading, error }
}