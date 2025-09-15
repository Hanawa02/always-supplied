import type { Database } from '~/types/supabase'
import type { Building, SupplyItem, BuyingItem } from '~/types'
import { supabase } from '~/lib/supabase'

export type CloudBuilding = Database['public']['Tables']['cloud_buildings']['Row']
export type CloudSupplyItem = Database['public']['Tables']['cloud_supply_items']['Row']
export type CloudBuyingItem = Database['public']['Tables']['cloud_buying_items']['Row']

export interface SyncResult<T> {
  success: boolean
  data?: T
  error?: string
  conflictResolved?: boolean
}

export interface MigrationProgress {
  total: number
  completed: number
  current?: string
  errors: string[]
}

export class CloudStorageService {
  private userId: string | null = null

  constructor() {
    // Update user ID when auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.userId = session?.user?.id || null
    })
  }

  private ensureAuthenticated(): string {
    if (!this.userId) {
      throw new Error('User must be authenticated to access cloud storage')
    }
    return this.userId
  }

  // Building Operations
  async syncBuilding(building: Building): Promise<SyncResult<CloudBuilding>> {
    try {
      const userId = this.ensureAuthenticated()

      const cloudBuilding = {
        local_id: building.id,
        name: building.name,
        location: building.location || '',
        description: building.description || '',
        created_at: building.createdAt ? new Date(building.createdAt).toISOString() : new Date().toISOString(),
        updated_at: building.updatedAt ? new Date(building.updatedAt).toISOString() : new Date().toISOString(),
        user_id: userId,
      }

      // Check if building already exists
      const { data: existing } = await supabase
        .from('cloud_buildings')
        .select('*')
        .eq('local_id', building.id)
        .eq('user_id', userId)
        .single()

      let result
      if (existing) {
        // Update existing building (conflict resolution: latest wins)
        const existingUpdatedAt = new Date(existing.updated_at).getTime()
        const buildingUpdatedAt = new Date(building.updatedAt || building.createdAt).getTime()

        if (buildingUpdatedAt >= existingUpdatedAt) {
          const { data, error } = await supabase
            .from('cloud_buildings')
            .update(cloudBuilding)
            .eq('id', existing.id)
            .select()
            .single()

          result = { data, error }
        } else {
          // Cloud version is newer, return existing
          result = { data: existing, error: null }
        }
      } else {
        // Create new building
        const { data, error } = await supabase
          .from('cloud_buildings')
          .insert(cloudBuilding)
          .select()
          .single()

        result = { data, error }
      }

      if (result.error) {
        return { success: false, error: result.error.message }
      }

      return {
        success: true,
        data: result.data,
        conflictResolved: existing && new Date(existing.updated_at).getTime() > new Date(building.updatedAt || building.createdAt).getTime()
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  async getBuildings(): Promise<SyncResult<CloudBuilding[]>> {
    try {
      const userId = this.ensureAuthenticated()

      const { data, error } = await supabase
        .from('cloud_buildings')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  async deleteBuilding(localId: string): Promise<SyncResult<void>> {
    try {
      const userId = this.ensureAuthenticated()

      const { error } = await supabase
        .from('cloud_buildings')
        .delete()
        .eq('local_id', localId)
        .eq('user_id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Supply Item Operations
  async syncSupplyItem(item: SupplyItem, buildingLocalId: string): Promise<SyncResult<CloudSupplyItem>> {
    try {
      const userId = this.ensureAuthenticated()

      // Get the cloud building ID
      const { data: building } = await supabase
        .from('cloud_buildings')
        .select('id')
        .eq('local_id', buildingLocalId)
        .eq('user_id', userId)
        .single()

      if (!building) {
        return { success: false, error: 'Building not found in cloud storage' }
      }

      const cloudItem = {
        building_id: building.id,
        local_id: item.id,
        name: item.name,
        category: item.category,
        current_stock: item.currentStock,
        minimum_stock: item.minimumStock,
        location: item.location || '',
        notes: item.notes || '',
        last_updated: item.lastUpdated ? new Date(item.lastUpdated).toISOString() : new Date().toISOString(),
        created_at: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Check if item already exists
      const { data: existing } = await supabase
        .from('cloud_supply_items')
        .select('*')
        .eq('local_id', item.id)
        .eq('building_id', building.id)
        .single()

      let result
      if (existing) {
        // Update existing item (conflict resolution: latest wins)
        const existingUpdatedAt = new Date(existing.last_updated).getTime()
        const itemUpdatedAt = new Date(item.lastUpdated || item.createdAt).getTime()

        if (itemUpdatedAt >= existingUpdatedAt) {
          const { data, error } = await supabase
            .from('cloud_supply_items')
            .update(cloudItem)
            .eq('id', existing.id)
            .select()
            .single()

          result = { data, error }
        } else {
          // Cloud version is newer, return existing
          result = { data: existing, error: null }
        }
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('cloud_supply_items')
          .insert(cloudItem)
          .select()
          .single()

        result = { data, error }
      }

      if (result.error) {
        return { success: false, error: result.error.message }
      }

      return {
        success: true,
        data: result.data,
        conflictResolved: existing && new Date(existing.last_updated).getTime() > new Date(item.lastUpdated || item.createdAt).getTime()
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  async getSupplyItems(buildingLocalId: string): Promise<SyncResult<CloudSupplyItem[]>> {
    try {
      const userId = this.ensureAuthenticated()

      // Get the cloud building ID
      const { data: building } = await supabase
        .from('cloud_buildings')
        .select('id')
        .eq('local_id', buildingLocalId)
        .eq('user_id', userId)
        .single()

      if (!building) {
        return { success: false, error: 'Building not found in cloud storage' }
      }

      const { data, error } = await supabase
        .from('cloud_supply_items')
        .select('*')
        .eq('building_id', building.id)
        .order('updated_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  async deleteSupplyItem(localId: string, buildingLocalId: string): Promise<SyncResult<void>> {
    try {
      const userId = this.ensureAuthenticated()

      // Get the cloud building ID
      const { data: building } = await supabase
        .from('cloud_buildings')
        .select('id')
        .eq('local_id', buildingLocalId)
        .eq('user_id', userId)
        .single()

      if (!building) {
        return { success: false, error: 'Building not found in cloud storage' }
      }

      const { error } = await supabase
        .from('cloud_supply_items')
        .delete()
        .eq('local_id', localId)
        .eq('building_id', building.id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Buying Item Operations
  async syncBuyingItem(item: BuyingItem, buildingLocalId: string): Promise<SyncResult<CloudBuyingItem>> {
    try {
      const userId = this.ensureAuthenticated()

      // Get the cloud building ID
      const { data: building } = await supabase
        .from('cloud_buildings')
        .select('id')
        .eq('local_id', buildingLocalId)
        .eq('user_id', userId)
        .single()

      if (!building) {
        return { success: false, error: 'Building not found in cloud storage' }
      }

      const cloudItem = {
        building_id: building.id,
        local_id: item.id,
        name: item.name,
        quantity: item.quantity,
        category: item.category || '',
        urgency: item.urgency || 'medium',
        notes: item.notes || '',
        is_purchased: item.isPurchased || false,
        purchased_date: item.purchasedDate ? new Date(item.purchasedDate).toISOString() : null,
        created_at: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
        updated_at: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString(),
      }

      // Check if item already exists
      const { data: existing } = await supabase
        .from('cloud_buying_items')
        .select('*')
        .eq('local_id', item.id)
        .eq('building_id', building.id)
        .single()

      let result
      if (existing) {
        // Update existing item (conflict resolution: latest wins)
        const existingUpdatedAt = new Date(existing.updated_at).getTime()
        const itemUpdatedAt = new Date(item.updatedAt || item.createdAt).getTime()

        if (itemUpdatedAt >= existingUpdatedAt) {
          const { data, error } = await supabase
            .from('cloud_buying_items')
            .update(cloudItem)
            .eq('id', existing.id)
            .select()
            .single()

          result = { data, error }
        } else {
          // Cloud version is newer, return existing
          result = { data: existing, error: null }
        }
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('cloud_buying_items')
          .insert(cloudItem)
          .select()
          .single()

        result = { data, error }
      }

      if (result.error) {
        return { success: false, error: result.error.message }
      }

      return {
        success: true,
        data: result.data,
        conflictResolved: existing && new Date(existing.updated_at).getTime() > new Date(item.updatedAt || item.createdAt).getTime()
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  async getBuyingItems(buildingLocalId: string): Promise<SyncResult<CloudBuyingItem[]>> {
    try {
      const userId = this.ensureAuthenticated()

      // Get the cloud building ID
      const { data: building } = await supabase
        .from('cloud_buildings')
        .select('id')
        .eq('local_id', buildingLocalId)
        .eq('user_id', userId)
        .single()

      if (!building) {
        return { success: false, error: 'Building not found in cloud storage' }
      }

      const { data, error } = await supabase
        .from('cloud_buying_items')
        .select('*')
        .eq('building_id', building.id)
        .order('updated_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  async deleteBuyingItem(localId: string, buildingLocalId: string): Promise<SyncResult<void>> {
    try {
      const userId = this.ensureAuthenticated()

      // Get the cloud building ID
      const { data: building } = await supabase
        .from('cloud_buildings')
        .select('id')
        .eq('local_id', buildingLocalId)
        .eq('user_id', userId)
        .single()

      if (!building) {
        return { success: false, error: 'Building not found in cloud storage' }
      }

      const { error } = await supabase
        .from('cloud_buying_items')
        .delete()
        .eq('local_id', localId)
        .eq('building_id', building.id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Bulk operations for migration
  async migrateLocalData(
    buildings: Building[],
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<MigrationProgress> {
    const progress: MigrationProgress = {
      total: buildings.length,
      completed: 0,
      errors: []
    }

    for (const building of buildings) {
      try {
        progress.current = `Migrating building: ${building.name}`
        onProgress?.(progress)

        // Sync building
        const buildingResult = await this.syncBuilding(building)
        if (!buildingResult.success) {
          progress.errors.push(`Building ${building.name}: ${buildingResult.error}`)
          continue
        }

        // Sync supply items
        if (building.supplyItems) {
          for (const item of building.supplyItems) {
            const itemResult = await this.syncSupplyItem(item, building.id)
            if (!itemResult.success) {
              progress.errors.push(`Supply item ${item.name}: ${itemResult.error}`)
            }
          }
        }

        // Sync buying items
        if (building.buyingItems) {
          for (const item of building.buyingItems) {
            const itemResult = await this.syncBuyingItem(item, building.id)
            if (!itemResult.success) {
              progress.errors.push(`Buying item ${item.name}: ${itemResult.error}`)
            }
          }
        }

        progress.completed++
        onProgress?.(progress)
      } catch (error) {
        progress.errors.push(`Building ${building.name}: ${(error as Error).message}`)
        progress.completed++
        onProgress?.(progress)
      }
    }

    progress.current = undefined
    return progress
  }
}

export const cloudStorage = new CloudStorageService()