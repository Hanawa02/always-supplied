import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { computed,ref } from 'vue'

import { supabase } from '~/lib/supabase'
import type { Building, BuyingItem,SupplyItem } from '~/types'
import type { Database } from '~/types/supabase'

type CloudBuilding = Database['public']['Tables']['cloud_buildings']['Row']
type CloudSupplyItem = Database['public']['Tables']['cloud_supply_items']['Row']
type CloudBuyingItem = Database['public']['Tables']['cloud_buying_items']['Row']

export interface RealtimeStatus {
  isConnected: boolean
  isSubscribed: boolean
  lastHeartbeat?: Date
  errors: string[]
}

export interface ChangeEvent {
  type: 'building' | 'supply_item' | 'buying_item'
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  data: any
  timestamp: Date
}

class RealtimeSyncService {
  private channels: Map<string, RealtimeChannel> = new Map()
  private isConnected = ref(false)
  private isSubscribed = ref(false)
  private lastHeartbeat = ref<Date | null>(null)
  private errors = ref<string[]>([])
  private changeListeners: ((event: ChangeEvent) => void)[] = []

  constructor() {
    // Monitor connection status
    supabase.realtime.onMessage((message) => {
      if (message.event === 'heartbeat') {
        this.lastHeartbeat.value = new Date()
        this.isConnected.value = true
      }
    })

    // Handle auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.subscribeToUserData(session.user.id)
      } else {
        this.unsubscribeAll()
      }
    })
  }

  get status(): RealtimeStatus {
    return {
      isConnected: this.isConnected.value,
      isSubscribed: this.isSubscribed.value,
      lastHeartbeat: this.lastHeartbeat.value || undefined,
      errors: this.errors.value
    }
  }

  // Subscribe to user's data changes
  async subscribeToUserData(userId: string): Promise<void> {
    try {
      this.unsubscribeAll()

      // Subscribe to buildings
      const buildingsChannel = supabase
        .channel(`buildings:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cloud_buildings',
            filter: `user_id=eq.${userId}`
          },
          (payload) => this.handleBuildingChange(payload)
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.isSubscribed.value = true
          } else if (status === 'CHANNEL_ERROR') {
            this.addError('Failed to subscribe to buildings channel')
          }
        })

      this.channels.set('buildings', buildingsChannel)

      // Subscribe to supply items (for all user's buildings)
      const supplyItemsChannel = supabase
        .channel(`supply_items:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cloud_supply_items'
          },
          (payload) => this.handleSupplyItemChange(payload, userId)
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            this.addError('Failed to subscribe to supply items channel')
          }
        })

      this.channels.set('supply_items', supplyItemsChannel)

      // Subscribe to buying items (for all user's buildings)
      const buyingItemsChannel = supabase
        .channel(`buying_items:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cloud_buying_items'
          },
          (payload) => this.handleBuyingItemChange(payload, userId)
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            this.addError('Failed to subscribe to buying items channel')
          }
        })

      this.channels.set('buying_items', buyingItemsChannel)

    } catch (error) {
      this.addError(`Subscription failed: ${(error as Error).message}`)
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    for (const [name, channel] of this.channels) {
      supabase.removeChannel(channel)
    }
    this.channels.clear()
    this.isSubscribed.value = false
  }

  // Handle building changes
  private async handleBuildingChange(
    payload: RealtimePostgresChangesPayload<CloudBuilding>
  ): Promise<void> {
    try {
      const event: ChangeEvent = {
        type: 'building',
        action: payload.eventType,
        data: payload.new || payload.old,
        timestamp: new Date()
      }

      this.notifyChangeListeners(event)

      // Update local state based on change
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        await this.syncBuildingToLocal(payload.new as CloudBuilding)
      } else if (payload.eventType === 'DELETE') {
        await this.removeBuildingFromLocal(payload.old as CloudBuilding)
      }
    } catch (error) {
      this.addError(`Building sync error: ${(error as Error).message}`)
    }
  }

  // Handle supply item changes
  private async handleSupplyItemChange(
    payload: RealtimePostgresChangesPayload<CloudSupplyItem>,
    userId: string
  ): Promise<void> {
    try {
      // Verify this item belongs to user's building
      const itemData = payload.new || payload.old
      if (!itemData) return

      const buildingOwnership = await this.verifyBuildingOwnership(itemData.building_id, userId)
      if (!buildingOwnership) return

      const event: ChangeEvent = {
        type: 'supply_item',
        action: payload.eventType,
        data: payload.new || payload.old,
        timestamp: new Date()
      }

      this.notifyChangeListeners(event)

      // Update local state based on change
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        await this.syncSupplyItemToLocal(payload.new as CloudSupplyItem, buildingOwnership.local_id)
      } else if (payload.eventType === 'DELETE') {
        await this.removeSupplyItemFromLocal(payload.old as CloudSupplyItem, buildingOwnership.local_id)
      }
    } catch (error) {
      this.addError(`Supply item sync error: ${(error as Error).message}`)
    }
  }

  // Handle buying item changes
  private async handleBuyingItemChange(
    payload: RealtimePostgresChangesPayload<CloudBuyingItem>,
    userId: string
  ): Promise<void> {
    try {
      // Verify this item belongs to user's building
      const itemData = payload.new || payload.old
      if (!itemData) return

      const buildingOwnership = await this.verifyBuildingOwnership(itemData.building_id, userId)
      if (!buildingOwnership) return

      const event: ChangeEvent = {
        type: 'buying_item',
        action: payload.eventType,
        data: payload.new || payload.old,
        timestamp: new Date()
      }

      this.notifyChangeListeners(event)

      // Update local state based on change
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        await this.syncBuyingItemToLocal(payload.new as CloudBuyingItem, buildingOwnership.local_id)
      } else if (payload.eventType === 'DELETE') {
        await this.removeBuyingItemFromLocal(payload.old as CloudBuyingItem, buildingOwnership.local_id)
      }
    } catch (error) {
      this.addError(`Buying item sync error: ${(error as Error).message}`)
    }
  }

  // Verify building ownership and get local ID
  private async verifyBuildingOwnership(buildingId: string, userId: string): Promise<{ local_id: string } | null> {
    try {
      const { data } = await supabase
        .from('cloud_buildings')
        .select('local_id')
        .eq('id', buildingId)
        .eq('user_id', userId)
        .single()

      return data
    } catch {
      return null
    }
  }

  // Sync building to local storage
  private async syncBuildingToLocal(cloudBuilding: CloudBuilding): Promise<void> {
    // Import here to avoid circular dependencies
    const { updateBuilding, addBuilding, getBuilding } = await import('~/composables/useBuildings')

    const localBuilding: Building = {
      id: cloudBuilding.local_id,
      name: cloudBuilding.name,
      location: cloudBuilding.location || undefined,
      description: cloudBuilding.description || undefined,
      createdAt: cloudBuilding.created_at,
      updatedAt: cloudBuilding.updated_at,
      supplyItems: [],
      buyingItems: []
    }

    const existing = getBuilding(cloudBuilding.local_id)
    if (existing) {
      // Preserve existing items when updating building
      localBuilding.supplyItems = existing.supplyItems
      localBuilding.buyingItems = existing.buyingItems
      updateBuilding(cloudBuilding.local_id, localBuilding)
    } else {
      addBuilding(localBuilding)
    }
  }

  // Remove building from local storage
  private async removeBuildingFromLocal(cloudBuilding: CloudBuilding): Promise<void> {
    const { removeBuilding } = await import('~/composables/useBuildings')
    removeBuilding(cloudBuilding.local_id)
  }

  // Sync supply item to local storage
  private async syncSupplyItemToLocal(cloudItem: CloudSupplyItem, buildingLocalId: string): Promise<void> {
    const { updateSupplyItem, addSupplyItem, getSupplyItem } = await import('~/composables/useBuildings')

    const localItem: SupplyItem = {
      id: cloudItem.local_id,
      name: cloudItem.name,
      category: cloudItem.category,
      currentStock: cloudItem.current_stock,
      minimumStock: cloudItem.minimum_stock,
      location: cloudItem.location || undefined,
      notes: cloudItem.notes || undefined,
      lastUpdated: cloudItem.last_updated,
      createdAt: cloudItem.created_at
    }

    const existing = getSupplyItem(buildingLocalId, cloudItem.local_id)
    if (existing) {
      updateSupplyItem(buildingLocalId, cloudItem.local_id, localItem)
    } else {
      addSupplyItem(buildingLocalId, localItem)
    }
  }

  // Remove supply item from local storage
  private async removeSupplyItemFromLocal(cloudItem: CloudSupplyItem, buildingLocalId: string): Promise<void> {
    const { removeSupplyItem } = await import('~/composables/useBuildings')
    removeSupplyItem(buildingLocalId, cloudItem.local_id)
  }

  // Sync buying item to local storage
  private async syncBuyingItemToLocal(cloudItem: CloudBuyingItem, buildingLocalId: string): Promise<void> {
    const { updateBuyingItem, addBuyingItem, getBuyingItem } = await import('~/composables/useBuildings')

    const localItem: BuyingItem = {
      id: cloudItem.local_id,
      name: cloudItem.name,
      quantity: cloudItem.quantity,
      category: cloudItem.category || undefined,
      urgency: cloudItem.urgency as 'low' | 'medium' | 'high' || 'medium',
      notes: cloudItem.notes || undefined,
      isPurchased: cloudItem.is_purchased,
      purchasedDate: cloudItem.purchased_date || undefined,
      createdAt: cloudItem.created_at,
      updatedAt: cloudItem.updated_at
    }

    const existing = getBuyingItem(buildingLocalId, cloudItem.local_id)
    if (existing) {
      updateBuyingItem(buildingLocalId, cloudItem.local_id, localItem)
    } else {
      addBuyingItem(buildingLocalId, localItem)
    }
  }

  // Remove buying item from local storage
  private async removeBuyingItemFromLocal(cloudItem: CloudBuyingItem, buildingLocalId: string): Promise<void> {
    const { removeBuyingItem } = await import('~/composables/useBuildings')
    removeBuyingItem(buildingLocalId, cloudItem.local_id)
  }

  // Add error to list
  private addError(error: string): void {
    this.errors.value.push(error)
    // Keep only last 10 errors
    if (this.errors.value.length > 10) {
      this.errors.value = this.errors.value.slice(-10)
    }
  }

  // Clear errors
  clearErrors(): void {
    this.errors.value = []
  }

  // Add change listener
  addChangeListener(listener: (event: ChangeEvent) => void): () => void {
    this.changeListeners.push(listener)

    // Return unsubscribe function
    return () => {
      const index = this.changeListeners.indexOf(listener)
      if (index > -1) {
        this.changeListeners.splice(index, 1)
      }
    }
  }

  // Notify all change listeners
  private notifyChangeListeners(event: ChangeEvent): void {
    for (const listener of this.changeListeners) {
      try {
        listener(event)
      } catch (error) {
        this.addError(`Change listener error: ${(error as Error).message}`)
      }
    }
  }

  // Get connection diagnostics
  getDiagnostics() {
    return {
      status: this.status,
      channelCount: this.channels.size,
      listenerCount: this.changeListeners.length,
      channels: Array.from(this.channels.keys())
    }
  }
}

export const realtimeSync = new RealtimeSyncService()