import { computed, ref, watch } from 'vue'

import { toast } from '~/components/ui/toast'
import { useAuth } from '~/composables/useAuth'
import { useBuildings } from '~/composables/useBuildings'
import { cloudStorage, type MigrationProgress, type SyncResult } from '~/services/cloudStorage'
import { offlineQueue, type QueueStatus } from '~/services/offlineQueue'
import type { Building, BuyingItem,SupplyItem } from '~/types'

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSync?: Date
  conflictsResolved: number
  pendingOperations: number
  errors: string[]
}

export function useCloudSync() {
  const { isAuthenticated } = useAuth()
  const { buildings: localBuildings, updateBuilding, addBuilding, removeBuilding } = useBuildings()

  // Sync state
  const isSyncing = ref(false)
  const lastSync = ref<Date | null>(null)
  const conflictsResolved = ref(0)
  const migrationProgress = ref<MigrationProgress | null>(null)

  // Computed sync status
  const syncStatus = computed((): SyncStatus => {
    const queueStatus: QueueStatus = offlineQueue.status

    return {
      isOnline: navigator.onLine,
      isSyncing: isSyncing.value || queueStatus.processing,
      lastSync: lastSync.value || queueStatus.lastSync,
      conflictsResolved: conflictsResolved.value,
      pendingOperations: queueStatus.pending,
      errors: queueStatus.errors
    }
  })

  // Auto-sync when authentication state changes
  watch(isAuthenticated, async (authenticated) => {
    if (authenticated && navigator.onLine) {
      await performInitialSync()
    }
  }, { immediate: true })

  // Auto-sync when coming back online
  watch(() => navigator.onLine, async (online) => {
    if (online && isAuthenticated.value) {
      await syncWithCloud()
    }
  })

  // Initial sync after authentication
  async function performInitialSync(): Promise<void> {
    if (!isAuthenticated.value || isSyncing.value) return

    try {
      isSyncing.value = true
      conflictsResolved.value = 0

      // Check if this is first time sync (migration needed)
      const cloudResult = await cloudStorage.getBuildings()

      if (cloudResult.success && cloudResult.data && cloudResult.data.length === 0 && localBuildings.value.length > 0) {
        // First time sync - migrate local data to cloud
        await migrateLocalDataToCloud()
      } else if (cloudResult.success && cloudResult.data) {
        // Sync down from cloud
        await syncFromCloud()
      }

      // Process any pending offline operations
      await offlineQueue.processQueue()

      lastSync.value = new Date()

      toast({
        title: 'Sync Complete',
        description: `Successfully synced ${localBuildings.value.length} buildings.`,
      })
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: (error as Error).message,
        variant: 'destructive',
      })
    } finally {
      isSyncing.value = false
    }
  }

  // Migrate local data to cloud
  async function migrateLocalDataToCloud(): Promise<void> {
    if (!isAuthenticated.value || localBuildings.value.length === 0) return

    migrationProgress.value = {
      total: localBuildings.value.length,
      completed: 0,
      errors: []
    }

    const progress = await cloudStorage.migrateLocalData(
      localBuildings.value,
      (p) => {
        migrationProgress.value = p
      }
    )

    migrationProgress.value = progress

    if (progress.errors.length > 0) {
      toast({
        title: 'Migration Completed with Errors',
        description: `${progress.completed}/${progress.total} buildings migrated. ${progress.errors.length} errors occurred.`,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Migration Complete',
        description: `Successfully migrated ${progress.completed} buildings to cloud.`,
      })
    }
  }

  // Sync from cloud to local
  async function syncFromCloud(): Promise<void> {
    if (!isAuthenticated.value) return

    const buildingsResult = await cloudStorage.getBuildings()
    if (!buildingsResult.success || !buildingsResult.data) return

    for (const cloudBuilding of buildingsResult.data) {
      // Convert cloud building to local format
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

      // Get supply items for this building
      const supplyResult = await cloudStorage.getSupplyItems(cloudBuilding.local_id)
      if (supplyResult.success && supplyResult.data) {
        localBuilding.supplyItems = supplyResult.data.map(item => ({
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

      // Get buying items for this building
      const buyingResult = await cloudStorage.getBuyingItems(cloudBuilding.local_id)
      if (buyingResult.success && buyingResult.data) {
        localBuilding.buyingItems = buyingResult.data.map(item => ({
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

      // Check if local building exists and handle conflicts
      const existingBuildingIndex = localBuildings.value.findIndex(b => b.id === localBuilding.id)

      if (existingBuildingIndex >= 0) {
        const existingBuilding = localBuildings.value[existingBuildingIndex]
        const existingUpdatedAt = new Date(existingBuilding.updatedAt || existingBuilding.createdAt).getTime()
        const cloudUpdatedAt = new Date(cloudBuilding.updated_at).getTime()

        if (cloudUpdatedAt > existingUpdatedAt) {
          // Cloud version is newer, update local
          updateBuilding(localBuilding.id, localBuilding)
          conflictsResolved.value++
        }
        // If local is newer or same, keep local version
      } else {
        // New building from cloud, add to local
        addBuilding(localBuilding)
      }
    }
  }

  // Sync specific building to cloud
  async function syncBuildingToCloud(building: Building): Promise<SyncResult<any>> {
    if (!isAuthenticated.value) {
      // Queue operation for later
      offlineQueue.addBuildingOperation('update', building.id, building)
      return { success: true }
    }

    const result = await cloudStorage.syncBuilding(building)

    if (result.conflictResolved) {
      conflictsResolved.value++
    }

    if (!result.success) {
      // Queue operation for retry
      offlineQueue.addBuildingOperation('update', building.id, building)
    }

    return result
  }

  // Sync specific supply item to cloud
  async function syncSupplyItemToCloud(item: SupplyItem, buildingId: string): Promise<SyncResult<any>> {
    if (!isAuthenticated.value) {
      offlineQueue.addSupplyItemOperation('update', item.id, buildingId, item)
      return { success: true }
    }

    const result = await cloudStorage.syncSupplyItem(item, buildingId)

    if (result.conflictResolved) {
      conflictsResolved.value++
    }

    if (!result.success) {
      offlineQueue.addSupplyItemOperation('update', item.id, buildingId, item)
    }

    return result
  }

  // Sync specific buying item to cloud
  async function syncBuyingItemToCloud(item: BuyingItem, buildingId: string): Promise<SyncResult<any>> {
    if (!isAuthenticated.value) {
      offlineQueue.addBuyingItemOperation('update', item.id, buildingId, item)
      return { success: true }
    }

    const result = await cloudStorage.syncBuyingItem(item, buildingId)

    if (result.conflictResolved) {
      conflictsResolved.value++
    }

    if (!result.success) {
      offlineQueue.addBuyingItemOperation('update', item.id, buildingId, item)
    }

    return result
  }

  // Delete operations
  async function deleteBuildingFromCloud(buildingId: string): Promise<SyncResult<void>> {
    if (!isAuthenticated.value) {
      offlineQueue.addBuildingOperation('delete', buildingId)
      return { success: true }
    }

    const result = await cloudStorage.deleteBuilding(buildingId)

    if (!result.success) {
      offlineQueue.addBuildingOperation('delete', buildingId)
    }

    return result
  }

  async function deleteSupplyItemFromCloud(itemId: string, buildingId: string): Promise<SyncResult<void>> {
    if (!isAuthenticated.value) {
      offlineQueue.addSupplyItemOperation('delete', itemId, buildingId)
      return { success: true }
    }

    const result = await cloudStorage.deleteSupplyItem(itemId, buildingId)

    if (!result.success) {
      offlineQueue.addSupplyItemOperation('delete', itemId, buildingId)
    }

    return result
  }

  async function deleteBuyingItemFromCloud(itemId: string, buildingId: string): Promise<SyncResult<void>> {
    if (!isAuthenticated.value) {
      offlineQueue.addBuyingItemOperation('delete', itemId, buildingId)
      return { success: true }
    }

    const result = await cloudStorage.deleteBuyingItem(itemId, buildingId)

    if (!result.success) {
      offlineQueue.addBuyingItemOperation('delete', itemId, buildingId)
    }

    return result
  }

  // Manual sync trigger
  async function syncWithCloud(): Promise<void> {
    if (!isAuthenticated.value || isSyncing.value) return

    try {
      isSyncing.value = true
      conflictsResolved.value = 0

      await syncFromCloud()
      await offlineQueue.processQueue()

      lastSync.value = new Date()

      if (syncStatus.value.pendingOperations === 0) {
        toast({
          title: 'Sync Complete',
          description: 'All data is up to date.',
        })
      }
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: (error as Error).message,
        variant: 'destructive',
      })
    } finally {
      isSyncing.value = false
    }
  }

  // Retry failed operations
  async function retryFailedOperations(): Promise<void> {
    await offlineQueue.retryFailedOperations()
  }

  // Clear sync errors
  function clearSyncErrors(): void {
    offlineQueue.clearErrors()
  }

  return {
    // State
    syncStatus,
    migrationProgress,

    // Actions
    performInitialSync,
    syncWithCloud,
    syncBuildingToCloud,
    syncSupplyItemToCloud,
    syncBuyingItemToCloud,
    deleteBuildingFromCloud,
    deleteSupplyItemFromCloud,
    deleteBuyingItemFromCloud,
    retryFailedOperations,
    clearSyncErrors,

    // Computed
    isOnline: computed(() => navigator.onLine),
    hasPendingOperations: computed(() => syncStatus.value.pendingOperations > 0),
    hasErrors: computed(() => syncStatus.value.errors.length > 0)
  }
}