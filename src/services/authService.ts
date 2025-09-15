import type { User } from '@supabase/supabase-js'

import { supabase } from '~/lib/supabase'
import type { UserProfile, CreateUserProfile, UpdateUserProfile } from '~/types/supabase'

/**
 * Service for managing user authentication and profiles
 */
export class AuthService {
  /**
   * Create or update user profile after authentication
   */
  static async ensureUserProfile(user: User): Promise<UserProfile | null> {
    try {
      // First, try to get existing profile
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (existingProfile) {
        return existingProfile
      }

      // Create new profile if it doesn't exist
      const profileData: CreateUserProfile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        preferred_locale: 'en',
      }

      const { data: newProfile, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return null
      }

      return newProfile
    } catch (error) {
      console.error('Error ensuring user profile:', error)
      return null
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      return null
    }
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error getting user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  /**
   * Search users by email (for sharing features)
   */
  static async searchUsersByEmail(email: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, avatar_url')
        .ilike('email', `%${email}%`)
        .limit(10)

      if (error) {
        console.error('Error searching users:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return !!user
    } catch {
      return false
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch {
      return null
    }
  }

  /**
   * Validate session and refresh if needed
   */
  static async validateSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        return false
      }

      // Check if session is close to expiring (within 5 minutes)
      const expiresAt = session.expires_at
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = expiresAt - now

      if (timeUntilExpiry < 300) { // 5 minutes
        // Try to refresh the session
        const { error: refreshError } = await supabase.auth.refreshSession()

        if (refreshError) {
          console.error('Error refreshing session:', refreshError)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error validating session:', error)
      return false
    }
  }

  /**
   * Handle authentication callback (for OAuth flows)
   */
  static async handleAuthCallback(): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        return { user: null, error: error.message }
      }

      if (!data.session?.user) {
        return { user: null, error: 'No user found in session' }
      }

      // Ensure user profile exists
      await this.ensureUserProfile(data.session.user)

      return { user: data.session.user, error: null }
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}