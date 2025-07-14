import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes: NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY requis')
}

// Client principal pour l'application (conservé pour compatibilité)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Fonction pour créer un client Supabase server-aware avec gestion des cookies
export function createSupabaseServerClient(request: NextRequest) {
  return createServerClient<Database>(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {
          // Pas de set dans les routes API - cookies gérés par le middleware
        },
        remove() {
          // Pas de remove dans les routes API - cookies gérés par le middleware
        },
      },
    }
  )
}

// Client admin pour les opérations serveur (si disponible)
export const supabaseAdmin = supabaseUrl && process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient<Database>(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null