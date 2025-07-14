import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { TimeSlot } from '@/types/database'

export function useTimeSlots(venueId?: string, date?: string, enablePolling = false, pollingInterval = 30000) {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSlots = useCallback(async () => {
    if (!venueId || !date) return

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
  }, [venueId, date])

  useEffect(() => {
    fetchSlots()
    
    // Optional polling for real-time updates
    if (enablePolling && venueId && date) {
      const interval = setInterval(fetchSlots, pollingInterval)
      return () => clearInterval(interval)
    }
  }, [fetchSlots, enablePolling, pollingInterval, venueId, date])

  const refreshSlots = useCallback(() => {
    fetchSlots()
  }, [fetchSlots])

  return { slots, loading, error, refreshSlots }
}