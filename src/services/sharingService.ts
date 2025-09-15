import { supabase } from '~/lib/supabase'
import type { Database } from '~/types/supabase'
import type { Building } from '~/types'

type BuildingShare = Database['public']['Tables']['building_shares']['Row']
type BuildingMember = Database['public']['Tables']['building_members']['Row']
type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export interface ShareResult {
  success: boolean
  shareCode?: string
  error?: string
}

export interface JoinResult {
  success: boolean
  building?: Building
  error?: string
}

export interface Member {
  id: string
  userId: string
  role: 'owner' | 'member'
  joinedAt: string
  profile?: {
    fullName?: string
    email?: string
    avatarUrl?: string
  }
}

export interface ShareInfo {
  shareCode: string
  createdAt: string
  expiresAt?: string
  isActive: boolean
  maxUses?: number
  currentUses: number
  createdBy: string
}

export class BuildingSharingService {
  private userId: string | null = null

  constructor() {
    // Update user ID when auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.userId = session?.user?.id || null
    })
  }

  private ensureAuthenticated(): string {
    if (!this.userId) {
      throw new Error('User must be authenticated to use sharing features')
    }
    return this.userId
  }

  // Generate share code for a building
  async generateShareCode(buildingLocalId: string, options?: {
    expiresIn?: number // hours
    maxUses?: number
  }): Promise<ShareResult> {
    try {
      const userId = this.ensureAuthenticated()

      // Get the cloud building
      const { data: building } = await supabase
        .from('cloud_buildings')
        .select('id')
        .eq('local_id', buildingLocalId)
        .eq('user_id', userId)
        .single()

      if (!building) {
        return { success: false, error: 'Building not found or you do not have permission' }
      }

      // Verify user is owner
      const { data: membership } = await supabase
        .from('building_members')
        .select('role')
        .eq('building_id', building.id)
        .eq('user_id', userId)
        .single()

      if (!membership || membership.role !== 'owner') {
        return { success: false, error: 'Only building owners can generate share codes' }
      }

      // Deactivate any existing active share codes
      await supabase
        .from('building_shares')
        .update({ is_active: false })
        .eq('building_id', building.id)
        .eq('is_active', true)

      // Generate new share code
      const expiresAt = options?.expiresIn
        ? new Date(Date.now() + options.expiresIn * 60 * 60 * 1000).toISOString()
        : null

      const { data: share, error } = await supabase
        .from('building_shares')
        .insert({
          building_id: building.id,
          created_by: userId,
          expires_at: expiresAt,
          max_uses: options?.maxUses || null,
          is_active: true
        })
        .select('share_code')
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, shareCode: share.share_code }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Join building using share code
  async joinBuilding(shareCode: string): Promise<JoinResult> {
    try {
      const userId = this.ensureAuthenticated()

      // Find the share
      const { data: share } = await supabase
        .from('building_shares')
        .select(`
          *,
          cloud_buildings!inner(*)
        `)
        .eq('share_code', shareCode)
        .eq('is_active', true)
        .single()

      if (!share) {
        return { success: false, error: 'Invalid or expired share code' }
      }

      // Check expiration
      if (share.expires_at && new Date(share.expires_at) < new Date()) {
        return { success: false, error: 'Share code has expired' }
      }

      // Check max uses
      if (share.max_uses && share.current_uses >= share.max_uses) {
        return { success: false, error: 'Share code has reached maximum uses' }
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('building_members')
        .select('id')
        .eq('building_id', share.building_id)
        .eq('user_id', userId)
        .single()

      if (existingMember) {
        return { success: false, error: 'You are already a member of this building' }
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from('building_members')
        .insert({
          building_id: share.building_id,
          user_id: userId,
          role: 'member'
        })

      if (memberError) {
        return { success: false, error: memberError.message }
      }

      // Increment share usage count
      await supabase
        .from('building_shares')
        .update({ current_uses: share.current_uses + 1 })
        .eq('id', share.id)

      // Get building data and convert to local format
      const cloudBuilding = (share as any).cloud_buildings
      const building: Building = {
        id: cloudBuilding.local_id,
        name: cloudBuilding.name,
        location: cloudBuilding.location || undefined,
        description: cloudBuilding.description || undefined,
        createdAt: cloudBuilding.created_at,
        updatedAt: cloudBuilding.updated_at,
        supplyItems: [],
        buyingItems: []
      }

      // Load items for the building
      await this.loadBuildingItems(building, cloudBuilding.id)

      return { success: true, building }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Load supply and buying items for a building
  private async loadBuildingItems(building: Building, cloudBuildingId: string): Promise<void> {
    // Load supply items
    const { data: supplyItems } = await supabase
      .from('cloud_supply_items')
      .select('*')
      .eq('building_id', cloudBuildingId)

    if (supplyItems) {
      building.supplyItems = supplyItems.map(item => ({
        id: item.local_id,
        name: item.name,
        category: item.category,
        currentStock: item.current_stock,
        minimumStock: item.minimum_stock,
        location: item.location || undefined,
        notes: item.notes || undefined,
        lastUpdated: item.last_updated,
        createdAt: item.created_at
      }))
    }

    // Load buying items
    const { data: buyingItems } = await supabase
      .from('cloud_buying_items')
      .select('*')
      .eq('building_id', cloudBuildingId)

    if (buyingItems) {
      building.buyingItems = buyingItems.map(item => ({
        id: item.local_id,
        name: item.name,
        quantity: item.quantity,
        category: item.category || undefined,
        urgency: item.urgency as 'low' | 'medium' | 'high' || 'medium',
        notes: item.notes || undefined,
        isPurchased: item.is_purchased,
        purchasedDate: item.purchased_date || undefined,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }))
    }
  }

  // Get members of a building
  async getBuildingMembers(buildingLocalId: string): Promise<Member[]> {
    try {
      const userId = this.ensureAuthenticated()

      // Get the cloud building
      const { data: building } = await supabase
        .from('cloud_buildings')
        .select('id')
        .eq('local_id', buildingLocalId)
        .eq('user_id', userId)
        .single()

      if (!building) {
        throw new Error('Building not found or you do not have permission')
      }

      // Get members with their profiles
      const { data: members } = await supabase
        .from('building_members')
        .select(`
          *,
          user_profiles(*)
        `)
        .eq('building_id', building.id)
        .order('created_at', { ascending: true })

      return (members || []).map(member => ({
        id: member.id,
        userId: member.user_id,
        role: member.role as 'owner' | 'member',
        joinedAt: member.created_at,
        profile: member.user_profiles ? {
          fullName: member.user_profiles.full_name || undefined,
          email: member.user_profiles.email || undefined,
          avatarUrl: member.user_profiles.avatar_url || undefined
        } : undefined
      }))
    } catch (error) {
      throw new Error(`Failed to get building members: ${(error as Error).message}`)
    }
  }

  // Remove member from building
  async removeMember(buildingLocalId: string, memberUserId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = this.ensureAuthenticated()

      // Get the cloud building
      const { data: building } = await supabase
        .from('cloud_buildings')
        .select('id')
        .eq('local_id', buildingLocalId)
        .eq('user_id', userId)
        .single()

      if (!building) {
        return { success: false, error: 'Building not found or you do not have permission' }
      }

      // Verify user is owner
      const { data: membership } = await supabase
        .from('building_members')
        .select('role')
        .eq('building_id', building.id)
        .eq('user_id', userId)
        .single()

      if (!membership || membership.role !== 'owner') {
        return { success: false, error: 'Only building owners can remove members' }
      }

      // Cannot remove owner
      if (memberUserId === userId) {
        return { success: false, error: 'Owner cannot be removed from building' }
      }

      // Remove member
      const { error } = await supabase
        .from('building_members')
        .delete()
        .eq('building_id', building.id)
        .eq('user_id', memberUserId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Get active share codes for a building
  async getActiveShareCodes(buildingLocalId: string): Promise<ShareInfo[]> {
    try {
      const userId = this.ensureAuthenticated()

      // Get the cloud building
      const { data: building } = await supabase
        .from('cloud_buildings')
        .select('id')
        .eq('local_id', buildingLocalId)
        .eq('user_id', userId)
        .single()

      if (!building) {
        throw new Error('Building not found or you do not have permission')
      }

      // Get active share codes
      const { data: shares } = await supabase
        .from('building_shares')
        .select('*')
        .eq('building_id', building.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      return (shares || []).map(share => ({
        shareCode: share.share_code,
        createdAt: share.created_at,
        expiresAt: share.expires_at || undefined,
        isActive: share.is_active,
        maxUses: share.max_uses || undefined,
        currentUses: share.current_uses,
        createdBy: share.created_by
      }))
    } catch (error) {
      throw new Error(`Failed to get share codes: ${(error as Error).message}`)
    }
  }

  // Deactivate share code
  async deactivateShareCode(shareCode: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = this.ensureAuthenticated()

      // Find the share and verify ownership
      const { data: share } = await supabase
        .from('building_shares')
        .select(`
          *,
          cloud_buildings!inner(user_id)
        `)
        .eq('share_code', shareCode)
        .single()

      if (!share) {
        return { success: false, error: 'Share code not found' }
      }

      // Verify user owns the building
      const buildingData = (share as any).cloud_buildings
      if (buildingData.user_id !== userId) {
        return { success: false, error: 'You do not have permission to deactivate this share code' }
      }

      // Deactivate the share code
      const { error } = await supabase
        .from('building_shares')
        .update({ is_active: false })
        .eq('share_code', shareCode)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Leave building (for members)
  async leaveBuilding(buildingLocalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = this.ensureAuthenticated()

      // Find the building by local ID from any building the user is a member of
      const { data: membership } = await supabase
        .from('building_members')
        .select(`
          *,
          cloud_buildings!inner(local_id, user_id)
        `)
        .eq('user_id', userId)
        .single()

      if (!membership) {
        return { success: false, error: 'You are not a member of any building with this ID' }
      }

      const buildingData = (membership as any).cloud_buildings
      if (buildingData.local_id !== buildingLocalId) {
        return { success: false, error: 'You are not a member of this building' }
      }

      // Owner cannot leave their own building
      if (membership.role === 'owner') {
        return { success: false, error: 'Building owner cannot leave. Transfer ownership or delete the building instead.' }
      }

      // Remove membership
      const { error } = await supabase
        .from('building_members')
        .delete()
        .eq('id', membership.id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Get user's role in a building
  async getUserRole(buildingLocalId: string): Promise<'owner' | 'member' | null> {
    try {
      const userId = this.ensureAuthenticated()

      // First check if user owns the building
      const { data: ownedBuilding } = await supabase
        .from('cloud_buildings')
        .select('id')
        .eq('local_id', buildingLocalId)
        .eq('user_id', userId)
        .single()

      if (ownedBuilding) {
        return 'owner'
      }

      // Check if user is a member
      const { data: membership } = await supabase
        .from('building_members')
        .select(`
          role,
          cloud_buildings!inner(local_id)
        `)
        .eq('user_id', userId)

      const buildingMembership = membership?.find(m => {
        const building = (m as any).cloud_buildings
        return building.local_id === buildingLocalId
      })

      return buildingMembership ? buildingMembership.role as 'owner' | 'member' : null
    } catch (error) {
      return null
    }
  }
}

export const buildingSharing = new BuildingSharingService()