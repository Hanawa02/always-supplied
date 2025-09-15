import { computed, ref, watch } from 'vue'

import { useAuth } from '~/composables/useAuth'
import { useBuildings } from '~/composables/useBuildings'
import { useCloudSync } from '~/composables/useCloudSync'
import type { Building } from '~/types'

export function useCloudBuildings() {
  const { isAuthenticated } = useAuth()
  const { buildings: localBuildings } = useBuildings()
  const {
    syncStatus,
    syncBuildingToCloud,
    deleteBuildingFromCloud,
    syncWithCloud,
    performInitialSync
  } = useCloudSync()

  // Combined local and cloud state for buildings
  const buildings = computed(() => {
    return localBuildings.value
  })

  // Auto-sync when authenticated
  watch(isAuthenticated, async (authenticated) => {
    if (authenticated) {
      await performInitialSync()
    }
  })

  // Building operations with cloud sync
  async function createBuilding(building: Omit<Building, 'id' | 'createdAt' | 'updatedAt'>) {
    // Import here to avoid circular dependency
    const { addBuilding } = await import('~/composables/useBuildings')
    const newBuilding = addBuilding(building)

    // Sync to cloud
    if (isAuthenticated.value) {
      await syncBuildingToCloud(newBuilding)
    }

    return newBuilding
  }

  async function updateBuilding(id: string, updates: Partial<Building>) {
    // Import here to avoid circular dependency
    const { updateBuilding: updateLocalBuilding, getBuilding } = await import('~/composables/useBuildings')

    const updated = updateLocalBuilding(id, updates)
    if (!updated) return null

    const building = getBuilding(id)
    if (building && isAuthenticated.value) {
      await syncBuildingToCloud(building)
    }

    return updated
  }

  async function deleteBuilding(id: string) {
    // Import here to avoid circular dependency
    const { removeBuilding } = await import('~/composables/useBuildings')

    const removed = removeBuilding(id)
    if (removed && isAuthenticated.value) {
      await deleteBuildingFromCloud(id)
    }

    return removed
  }

  // Supply item operations with cloud sync
  async function createSupplyItem(buildingId: string, item: any) {
    // Import here to avoid circular dependency
    const { addSupplyItem } = await import('~/composables/useBuildings')
    const newItem = addSupplyItem(buildingId, item)

    if (newItem && isAuthenticated.value) {
      const { syncSupplyItemToCloud } = await import('~/composables/useCloudSync')
      await syncSupplyItemToCloud(newItem, buildingId)
    }

    return newItem
  }

  async function updateSupplyItem(buildingId: string, itemId: string, updates: any) {
    // Import here to avoid circular dependency
    const { updateSupplyItem: updateLocalSupplyItem, getSupplyItem } = await import('~/composables/useBuildings')

    const updated = updateLocalSupplyItem(buildingId, itemId, updates)
    if (!updated) return null

    const item = getSupplyItem(buildingId, itemId)
    if (item && isAuthenticated.value) {
      const { syncSupplyItemToCloud } = await import('~/composables/useCloudSync')
      await syncSupplyItemToCloud(item, buildingId)
    }

    return updated
  }

  async function deleteSupplyItem(buildingId: string, itemId: string) {
    // Import here to avoid circular dependency
    const { removeSupplyItem } = await import('~/composables/useBuildings')

    const removed = removeSupplyItem(buildingId, itemId)
    if (removed && isAuthenticated.value) {
      const { deleteSupplyItemFromCloud } = await import('~/composables/useCloudSync')
      await deleteSupplyItemFromCloud(itemId, buildingId)
    }

    return removed
  }

  // Buying item operations with cloud sync
  async function createBuyingItem(buildingId: string, item: any) {
    // Import here to avoid circular dependency
    const { addBuyingItem } = await import('~/composables/useBuildings')
    const newItem = addBuyingItem(buildingId, item)

    if (newItem && isAuthenticated.value) {
      const { syncBuyingItemToCloud } = await import('~/composables/useCloudSync')
      await syncBuyingItemToCloud(newItem, buildingId)
    }

    return newItem
  }

  async function updateBuyingItem(buildingId: string, itemId: string, updates: any) {
    // Import here to avoid circular dependency
    const { updateBuyingItem: updateLocalBuyingItem, getBuyingItem } = await import('~/composables/useBuildings')

    const updated = updateLocalBuyingItem(buildingId, itemId, updates)
    if (!updated) return null

    const item = getBuyingItem(buildingId, itemId)
    if (item && isAuthenticated.value) {
      const { syncBuyingItemToCloud } = await import('~/composables/useCloudSync')
      await syncBuyingItemToCloud(item, buildingId)
    }

    return updated
  }

  async function deleteBuyingItem(buildingId: string, itemId: string) {
    // Import here to avoid circular dependency
    const { removeBuyingItem } = await import('~/composables/useBuildings')

    const removed = removeBuyingItem(buildingId, itemId)
    if (removed && isAuthenticated.value) {
      const { deleteBuyingItemFromCloud } = await import('~/composables/useCloudSync')
      await deleteBuyingItemFromCloud(itemId, buildingId)
    }

    return removed
  }

  // Manual sync operations
  async function refreshFromCloud() {
    if (isAuthenticated.value) {
      await syncWithCloud()
    }
  }

  return {
    // State
    buildings,
    syncStatus,

    // Building operations
    createBuilding,
    updateBuilding,
    deleteBuilding,

    // Supply item operations
    createSupplyItem,
    updateSupplyItem,
    deleteSupplyItem,

    // Buying item operations
    createBuyingItem,
    updateBuyingItem,
    deleteBuyingItem,

    // Sync operations
    refreshFromCloud,

    // Computed
    isAuthenticated,
    isOnline: computed(() => navigator.onLine),
    isSyncing: computed(() => syncStatus.value.isSyncing),
    hasPendingOperations: computed(() => syncStatus.value.pendingOperations > 0),
    hasErrors: computed(() => syncStatus.value.errors.length > 0)
  }
}