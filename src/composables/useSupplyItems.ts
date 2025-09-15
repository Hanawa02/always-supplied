import { computed, onMounted, ref } from "vue"

import { supplyItemsStorage } from "~/services/supplyItemsStorage"
import type { CreateSupplyItem, SupplyItem, UpdateSupplyItem } from "~/types/supply"

export function useSupplyItems() {
  const supplyItems = ref<SupplyItem[]>([])
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // Computed values
  const totalItems = computed(() => supplyItems.value.length)
  const categories = computed(() => {
    const uniqueCategories = new Set(supplyItems.value.map((item) => item.category).filter(Boolean))
    return Array.from(uniqueCategories).sort()
  })

  const storageRooms = computed(() => {
    const uniqueRooms = new Set(supplyItems.value.map((item) => item.storageRoom).filter(Boolean))
    return Array.from(uniqueRooms).sort()
  })

  // Initialize data from storage
  const initializeData = async () => {
    if (isInitialized.value) return

    isLoading.value = true
    try {
      const items = await supplyItemsStorage.getAll()
      supplyItems.value = items
      isInitialized.value = true
    } catch (error) {
      console.error("Failed to load supply items from storage:", error)
    } finally {
      isLoading.value = false
    }
  }

  // Auto-initialize on first access
  onMounted(() => {
    initializeData()
  })

  // CRUD operations
  const createSupplyItem = async (item: CreateSupplyItem): Promise<SupplyItem> => {
    await initializeData() // Ensure data is loaded

    isLoading.value = true
    try {
      const newItem = await supplyItemsStorage.create(item)
      supplyItems.value.push(newItem)
      // Sort to maintain alphabetical order
      supplyItems.value.sort((a, b) => a.name.localeCompare(b.name))
      return newItem
    } catch (error) {
      console.error("Failed to create supply item:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateSupplyItem = async (updatedItem: UpdateSupplyItem): Promise<SupplyItem | null> => {
    await initializeData() // Ensure data is loaded

    isLoading.value = true
    try {
      const updated = await supplyItemsStorage.updateFromData(updatedItem)
      if (!updated) return null

      const index = supplyItems.value.findIndex((item) => item.id === updatedItem.id)
      if (index !== -1) {
        supplyItems.value[index] = updated
        // Re-sort to maintain alphabetical order
        supplyItems.value.sort((a, b) => a.name.localeCompare(b.name))
      }
      return updated
    } catch (error) {
      console.error("Failed to update supply item:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteSupplyItem = async (id: string): Promise<boolean> => {
    await initializeData() // Ensure data is loaded

    isLoading.value = true
    try {
      const deleted = await supplyItemsStorage.delete(id)
      if (!deleted) {
        console.error("Failed to delete supply item from database")
        throw new Error("Failed to delete supply item from database")
      }

      const index = supplyItems.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        supplyItems.value.splice(index, 1)
      }
      return true
    } catch (error) {
      console.error("Failed to delete supply item:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const getSupplyItem = (id: string): SupplyItem | undefined => {
    return supplyItems.value.find((item) => item.id === id)
  }

  // Get supply item with async fallback to storage
  const getSupplyItemAsync = async (id: string): Promise<SupplyItem | undefined> => {
    await initializeData() // Ensure data is loaded
    return getSupplyItem(id)
  }

  // Filter functions
  const filterByCategory = (category: string) => {
    return supplyItems.value.filter((item) => item.category === category)
  }

  const filterByStorageRoom = (room: string) => {
    return supplyItems.value.filter((item) => item.storageRoom === room)
  }

  const filterByBuildingId = (buildingId: string) => {
    return supplyItems.value.filter((item) => item.buildingId === buildingId)
  }

  const searchSupplyItems = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return supplyItems.value.filter(
      (item) =>
        item.name.toLowerCase().includes(lowercaseQuery) ||
        item.description?.toLowerCase().includes(lowercaseQuery) ||
        item.category?.toLowerCase().includes(lowercaseQuery),
    )
  }

  // Advanced search with storage fallback
  const searchSupplyItemsAsync = async (query: string): Promise<SupplyItem[]> => {
    await initializeData() // Ensure data is loaded
    return searchSupplyItems(query)
  }

  return {
    // State
    supplyItems: computed(() => supplyItems.value),
    isLoading: computed(() => isLoading.value),
    isInitialized: computed(() => isInitialized.value),
    totalItems,
    categories,
    storageRooms,

    // CRUD operations
    createSupplyItem,
    updateSupplyItem,
    deleteSupplyItem,
    getSupplyItem,
    getSupplyItemAsync,

    // Filters
    filterByCategory,
    filterByStorageRoom,
    filterByBuildingId,
    searchSupplyItems,
    searchSupplyItemsAsync,

    // Manual data refresh
    refreshData: initializeData,
  }
}
