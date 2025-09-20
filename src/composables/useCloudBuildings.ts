import { computed, watch } from "vue"

import { use_auth } from "~/composables/use-auth"
import { useCloudSync } from "~/composables/useCloudSync"
import { useSuppliedBuildings } from "~/composables/useSuppliedBuildings"

export function useCloudBuildings() {
  const { isAuthenticated } = use_auth()
  const { suppliedBuildings: localBuildings } = useSuppliedBuildings()
  const { syncStatus, syncWithCloud, performInitialSync } = useCloudSync()

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
  async function createBuilding(building: { name: string; description?: string }) {
    // TODO: Implement cloud-aware building creation
    const { createSuppliedBuilding } = useSuppliedBuildings()
    const newBuilding = await createSuppliedBuilding({
      name: building.name,
      description: building.description,
    })

    // TODO: Sync to cloud when integration is complete
    console.log("Cloud sync for new building will be added:", newBuilding.id)

    return newBuilding
  }

  async function updateBuilding(id: string, updates: { name?: string; description?: string }) {
    // TODO: Implement cloud-aware building updates
    const { updateSuppliedBuilding } = useSuppliedBuildings()

    const updated = await updateSuppliedBuilding({
      id,
      name: updates.name,
      description: updates.description,
    })

    // TODO: Sync to cloud when integration is complete
    console.log("Cloud sync for updated building will be added:", id)

    return updated
  }

  async function deleteBuilding(id: string) {
    // TODO: Implement cloud-aware building deletion
    const { deleteSuppliedBuilding } = useSuppliedBuildings()

    await deleteSuppliedBuilding(id)

    // TODO: Sync to cloud when integration is complete
    console.log("Cloud sync for deleted building will be added:", id)

    return true
  }

  // Supply item operations with cloud sync (TODO: Implement when supply/buying item cloud sync is ready)
  async function createSupplyItem(buildingId: string, item: Record<string, unknown>) {
    console.log("Supply item cloud sync not yet implemented:", buildingId, item)
    return null
  }

  async function updateSupplyItem(
    buildingId: string,
    itemId: string,
    updates: Record<string, unknown>,
  ) {
    console.log("Supply item cloud sync not yet implemented:", buildingId, itemId, updates)
    return null
  }

  async function deleteSupplyItem(buildingId: string, itemId: string) {
    console.log("Supply item cloud sync not yet implemented:", buildingId, itemId)
    return null
  }

  // Buying item operations with cloud sync (TODO: Implement when supply/buying item cloud sync is ready)
  async function createBuyingItem(buildingId: string, item: Record<string, unknown>) {
    console.log("Buying item cloud sync not yet implemented:", buildingId, item)
    return null
  }

  async function updateBuyingItem(
    buildingId: string,
    itemId: string,
    updates: Record<string, unknown>,
  ) {
    console.log("Buying item cloud sync not yet implemented:", buildingId, itemId, updates)
    return null
  }

  async function deleteBuyingItem(buildingId: string, itemId: string) {
    console.log("Buying item cloud sync not yet implemented:", buildingId, itemId)
    return null
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
    hasErrors: computed(() => syncStatus.value.errors.length > 0),
  }
}
