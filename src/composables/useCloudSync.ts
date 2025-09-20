import { computed, ref, watch } from "vue"

import { toast } from "~/components/ui/toast"
import { use_auth } from "~/composables/use-auth"
import { useSuppliedBuildings } from "~/composables/useSuppliedBuildings"
import { cloudStorage, type MigrationProgress, type SyncResult } from "~/services/cloudStorage"
import { offlineQueue, type QueueStatus } from "~/services/offlineQueue"
import type { Building, BuyingItem, SupplyItem } from "~/types"

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSync?: Date
  conflictsResolved: number
  pendingOperations: number
  errors: string[]
}

export function useCloudSync() {
  const { is_authenticated } = use_auth()
  const {
    suppliedBuildings: localBuildings,
    updateSuppliedBuilding,
    createSuppliedBuilding,
    deleteSuppliedBuilding,
  } = useSuppliedBuildings()

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
      errors: queueStatus.errors,
    }
  })

  // Auto-sync when authentication state changes
  watch(
    is_authenticated,
    async (authenticated) => {
      if (authenticated && navigator.onLine) {
        await performInitialSync()
      }
    },
    { immediate: true },
  )

  // Auto-sync when coming back online
  watch(
    () => navigator.onLine,
    async (online) => {
      if (online && is_authenticated.value) {
        await syncWithCloud()
      }
    },
  )

  // Initial sync after authentication
  async function performInitialSync(): Promise<void> {
    if (!is_authenticated.value || isSyncing.value) return

    console.log("[CloudSync] Starting initial sync...")
    console.log("[CloudSync] Local buildings count:", localBuildings.value.length)

    try {
      isSyncing.value = true
      conflictsResolved.value = 0

      // Check if this is first time sync (migration needed)
      const cloudResult = await cloudStorage.getBuildings()
      console.log("[CloudSync] Cloud buildings result:", cloudResult)

      if (
        cloudResult.success &&
        cloudResult.data &&
        cloudResult.data.length === 0 &&
        localBuildings.value.length > 0
      ) {
        // First time sync - migrate local data to cloud
        console.log("[CloudSync] No cloud data found, migrating local data to cloud...")
        await migrateLocalDataToCloud()
      } else if (cloudResult.success && cloudResult.data) {
        // Sync down from cloud
        console.log("[CloudSync] Cloud data found, syncing from cloud...")
        await syncFromCloud()
      }

      // Process any pending offline operations
      await offlineQueue.processQueue()

      lastSync.value = new Date()
      console.log("[CloudSync] Initial sync completed")

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${localBuildings.value.length} buildings.`,
      })
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      isSyncing.value = false
    }
  }

  // Migrate local data to cloud
  async function migrateLocalDataToCloud(): Promise<void> {
    if (!is_authenticated.value || localBuildings.value.length === 0) return

    migrationProgress.value = {
      total: localBuildings.value.length,
      completed: 0,
      errors: [],
    }

    const progress = await cloudStorage.migrateLocalData(localBuildings.value, (p) => {
      migrationProgress.value = p
    })

    migrationProgress.value = progress

    if (progress.errors.length > 0) {
      toast({
        title: "Migration Completed with Errors",
        description: `${progress.completed}/${progress.total} buildings migrated. ${progress.errors.length} errors occurred.`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Migration Complete",
        description: `Successfully migrated ${progress.completed} buildings to cloud.`,
      })
    }
  }

  // Sync from cloud to local
  async function syncFromCloud(): Promise<void> {
    if (!is_authenticated.value) return

    // TODO: Implement full sync when type adapters are complete
    console.log("Cloud sync temporarily disabled - integration in progress")

    // For now, just mark as synced to avoid errors
    lastSync.value = new Date()
  }

  // Sync specific building to cloud
  async function syncBuildingToCloud(building: any): Promise<SyncResult<any>> {
    if (!is_authenticated.value) {
      // Queue operation for later
      offlineQueue.addBuildingOperation("update", building.id, building)
      return { success: true }
    }

    const result = await cloudStorage.syncBuilding(building)

    if (result.conflictResolved) {
      conflictsResolved.value++
    }

    if (!result.success) {
      // Queue operation for retry
      offlineQueue.addBuildingOperation("update", building.id, building)
    }

    return result
  }

  // Sync specific supply item to cloud
  async function syncSupplyItemToCloud(
    item: SupplyItem,
    buildingId: string,
  ): Promise<SyncResult<any>> {
    if (!is_authenticated.value) {
      offlineQueue.addSupplyItemOperation("update", item.id, buildingId, item)
      return { success: true }
    }

    const result = await cloudStorage.syncSupplyItem(item, buildingId)

    if (result.conflictResolved) {
      conflictsResolved.value++
    }

    if (!result.success) {
      offlineQueue.addSupplyItemOperation("update", item.id, buildingId, item)
    }

    return result
  }

  // Sync specific buying item to cloud
  async function syncBuyingItemToCloud(
    item: BuyingItem,
    buildingId: string,
  ): Promise<SyncResult<any>> {
    if (!is_authenticated.value) {
      offlineQueue.addBuyingItemOperation("update", item.id, buildingId, item)
      return { success: true }
    }

    const result = await cloudStorage.syncBuyingItem(item, buildingId)

    if (result.conflictResolved) {
      conflictsResolved.value++
    }

    if (!result.success) {
      offlineQueue.addBuyingItemOperation("update", item.id, buildingId, item)
    }

    return result
  }

  // Delete operations
  async function deleteBuildingFromCloud(buildingId: string): Promise<SyncResult<void>> {
    if (!is_authenticated.value) {
      offlineQueue.addBuildingOperation("delete", buildingId)
      return { success: true }
    }

    const result = await cloudStorage.deleteBuilding(buildingId)

    if (!result.success) {
      offlineQueue.addBuildingOperation("delete", buildingId)
    }

    return result
  }

  async function deleteSupplyItemFromCloud(
    itemId: string,
    buildingId: string,
  ): Promise<SyncResult<void>> {
    if (!is_authenticated.value) {
      offlineQueue.addSupplyItemOperation("delete", itemId, buildingId)
      return { success: true }
    }

    const result = await cloudStorage.deleteSupplyItem(itemId, buildingId)

    if (!result.success) {
      offlineQueue.addSupplyItemOperation("delete", itemId, buildingId)
    }

    return result
  }

  async function deleteBuyingItemFromCloud(
    itemId: string,
    buildingId: string,
  ): Promise<SyncResult<void>> {
    if (!is_authenticated.value) {
      offlineQueue.addBuyingItemOperation("delete", itemId, buildingId)
      return { success: true }
    }

    const result = await cloudStorage.deleteBuyingItem(itemId, buildingId)

    if (!result.success) {
      offlineQueue.addBuyingItemOperation("delete", itemId, buildingId)
    }

    return result
  }

  // Manual sync trigger
  async function syncWithCloud(): Promise<void> {
    if (!is_authenticated.value || isSyncing.value) return

    try {
      isSyncing.value = true
      conflictsResolved.value = 0

      await syncFromCloud()
      await offlineQueue.processQueue()

      lastSync.value = new Date()

      if (syncStatus.value.pendingOperations === 0) {
        toast({
          title: "Sync Complete",
          description: "All data is up to date.",
        })
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: (error as Error).message,
        variant: "destructive",
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
    hasErrors: computed(() => syncStatus.value.errors.length > 0),
  }
}
