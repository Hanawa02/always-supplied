import { createClient } from "@supabase/supabase-js"

import type { Database } from "~/types/supabase"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.",
  )
}

export const SUPABASE_TOKEN_STORAGE_KEY = "as_supabase_token"
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce", // Use PKCE flow for better security and compatibility
    debug: false, // Enable auth debug logging
    storage: window?.localStorage, // Explicitly use localStorage
    // Remove custom storage key to let Supabase handle it with proper domain isolation
    // storageKey: "supabase.auth.token", // This was causing conflicts
    storageKey: SUPABASE_TOKEN_STORAGE_KEY,
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

// Helper function to clear session and retry login (for troubleshooting)
export const clearAuthSession = async () => {
  try {
    // Clear all Supabase-related items from localStorage
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes("supabase") || key.includes("sb-"))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))

    // Also clear session cookies if any
    document.cookie.split(";").forEach((c) => {
      if (c.includes("sb-") || c.includes("supabase")) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      }
    })

    console.log("[Auth] Cleared all Supabase sessions from storage")
    return { success: true }
  } catch (error) {
    console.error("[Auth] Error clearing sessions:", error)
    return { success: false, error }
  }
}
