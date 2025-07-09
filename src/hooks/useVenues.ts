import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SportType, Venue } from '@/types/database'

export function useVenues(sport?: SportType) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true)
      const query = supabase
        .from('venues')
        .select('*')
        .order('name', { ascending: true })

      if (sport) {
        query.eq('sport_type', sport)
      }

      const { data, error } = await query

      if (error) {
        setError(error.message)
      } else {
        setVenues(data as Venue[])
      }
      setLoading(false)
    }

    fetchVenues()
  }, [sport])

  return { venues, loading, error }
}