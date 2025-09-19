import type { AuthError,Session, User } from '@supabase/supabase-js'
import { computed, ref } from 'vue'

import { supabase } from '~/lib/supabase'
import type { UserProfile } from '~/types/supabase'

// Global auth state
const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const profile = ref<UserProfile | null>(null)
const loading = ref(true)
const initializing = ref(true)

// Initialize auth state listener
supabase.auth.onAuthStateChange(async (event, newSession) => {
  session.value = newSession
  user.value = newSession?.user ?? null

  if (event === 'SIGNED_IN' && newSession?.user) {
    await loadUserProfile(newSession.user.id)
  } else if (event === 'SIGNED_OUT') {
    profile.value = null
  }

  loading.value = false
  if (initializing.value) {
    initializing.value = false
  }
})

// Load user profile from database
async function loadUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error loading user profile:', error)
      return
    }

    profile.value = data
  } catch (error) {
    console.error('Error loading user profile:', error)
  }
}

export function useAuth() {
  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = computed(() => loading.value)
  const isInitializing = computed(() => initializing.value)
  const userEmail = computed(() => user.value?.email)
  const userName = computed(() => profile.value?.full_name || userEmail.value?.split('@')[0])
  const userAvatar = computed(() => profile.value?.avatar_url)

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData?: { fullName?: string }) => {
    loading.value = true

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.fullName,
          },
        },
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error: error as AuthError }
    } finally {
      loading.value = false
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    loading.value = true

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error: error as AuthError }
    } finally {
      loading.value = false
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    loading.value = true

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { data: null, error: error as AuthError }
    } finally {
      loading.value = false
    }
  }

  // Sign out
  const signOut = async () => {
    loading.value = true

    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      // Clear local state
      user.value = null
      session.value = null
      profile.value = null

      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: error as AuthError }
    } finally {
      loading.value = false
    }
  }

  // Send password reset email
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Password reset error:', error)
      return { error: error as AuthError }
    }
  }

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user.value) {
      throw new Error('No authenticated user')
    }

    loading.value = true

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.value.id)
        .select()
        .single()

      if (error) throw error

      profile.value = data
      return { data, error: null }
    } catch (error) {
      console.error('Profile update error:', error)
      return { data: null, error: error as Error }
    } finally {
      loading.value = false
    }
  }

  // Update user password
  const updatePassword = async (newPassword: string) => {
    loading.value = true

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Password update error:', error)
      return { error: error as AuthError }
    } finally {
      loading.value = false
    }
  }

  // Delete user account
  const deleteAccount = async () => {
    if (!user.value) {
      throw new Error('No authenticated user')
    }

    loading.value = true

    try {
      // Note: This requires a database function or admin action
      // For now, we'll just sign out and let admin handle deletion
      await signOut()
      return { error: null }
    } catch (error) {
      console.error('Account deletion error:', error)
      return { error: error as Error }
    } finally {
      loading.value = false
    }
  }

  // Get current session
  const getCurrentSession = async () => {
    const { data: { session: currentSession }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting session:', error)
      return null
    }

    return currentSession
  }

  // Refresh session
  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      console.error('Error refreshing session:', error)
      return { data: null, error }
    }

    return { data, error: null }
  }

  return {
    // State
    user: computed(() => user.value),
    session: computed(() => session.value),
    profile: computed(() => profile.value),
    isAuthenticated,
    isLoading,
    isInitializing,
    userEmail,
    userName,
    userAvatar,

    // Actions
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    updatePassword,
    deleteAccount,
    getCurrentSession,
    refreshSession,
  }
}