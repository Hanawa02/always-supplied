import { createClient } from "@supabase/supabase-js"

import type { Database } from "~/types/supabase"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.",
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce", // Use PKCE flow for better security and compatibility
    debug: false, // Enable auth debug logging
    storage: window?.localStorage, // Explicitly use localStorage
    storageKey: "supabase.auth.token", // Custom storage key
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      "X-Client-Info": "always-supplied-web",
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
