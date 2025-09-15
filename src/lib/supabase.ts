import { createClient } from '@supabase/supabase-js'

import type { Database } from '~/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Helper function to check if user is authenticated
export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

// Helper function to get current session
export const getCurrentSession = () => {
  return supabase.auth.getSession()
}

// Helper function to sign out
export const signOut = () => {
  return supabase.auth.signOut()
}