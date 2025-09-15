import { computed, onMounted, ref } from "vue"

import { buyingItemsStorage } from "~/services/buyingItemsStorage"
import type { BuyingItem, CreateBuyingItem, UpdateBuyingItem } from "~/types/buyingItem"
import type { SupplyItem } from "~/types/supply"

export function useBuyingItems() {
  const buyingItems = ref<BuyingItem[]>([])
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const showBoughtItems = ref(true) // Toggle for showing/hiding bought items

  // Computed values
  const totalItems = computed(() => buyingItems.value.length)
  const activeItems = computed(() => buyingItems.value.filter((item) => !item.isBought))
  const boughtItems = computed(() => buyingItems.value.filter((item) => item.isBought))
  const visibleItems = computed(() =>
    showBoughtItems.value ? buyingItems.value : activeItems.value,
  )

  const categories = computed(() => {
    const uniqueCategories = new Set(buyingItems.value.map((item) => item.category).filter(Boolean))
    return Array.from(uniqueCategories).sort()
  })

  // Initialize data from storage
  const initializeData = async () => {
    if (isInitialized.value) return

    isLoading.value = true
    try {
      const items = await buyingItemsStorage.getAll()
      buyingItems.value = items
      isInitialized.value = true
    } catch (error) {
      console.error("Failed to load buying items from storage:", error)
    } finally {
      isLoading.value = false
    }
  }

  // Auto-initialize on first access
  onMounted(() => {
    initializeData()
  })

  // Create buying item from supply item
  const createFromSupplyItem = async (
    supplyItem: SupplyItem,
    customQuantity?: number,
  ): Promise<BuyingItem> => {
    await initializeData() // Ensure data is loaded

    // Check if there's already an unbought buying item for this supply item
    const existingItem = buyingItems.value.find(
      (item) => item.supplyItemId === supplyItem.id && !item.isBought,
    )

    if (existingItem) {
      // Update the existing item's quantity instead of creating a duplicate
      const newQuantity = existingItem.quantity + (customQuantity || supplyItem.quantity)
      const updateData: UpdateBuyingItem = {
        id: existingItem.id,
        quantity: newQuantity,
      }
      const result = await updateBuyingItem(updateData)
      return result || existingItem
    }

    // No existing unbought item found, create a new one
    const createData: CreateBuyingItem = {
      supplyItemId: supplyItem.id,
      buildingId: supplyItem.buildingId,
      name: supplyItem.name,
      description: supplyItem.description,
      quantity: customQuantity || supplyItem.quantity,
      shoppingHint: supplyItem.shoppingHint,
      category: supplyItem.category,
      storageRoom: supplyItem.storageRoom,
      // Create a clean copy of the array to avoid Vue reactivity issues
      preferredBrands: supplyItem.preferredBrands ? [...supplyItem.preferredBrands] : undefined,
    }

    return await createBuyingItem(createData)
  }

  // CRUD operations
  const createBuyingItem = async (item: CreateBuyingItem): Promise<BuyingItem> => {
    await initializeData() // Ensure data is loaded

    isLoading.value = true
    try {
      const newItem = await buyingItemsStorage.create(item)
      buyingItems.value.unshift(newItem) // Add to beginning
      return newItem
    } catch (error) {
      console.error("Failed to create buying item:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateBuyingItem = async (updatedItem: UpdateBuyingItem): Promise<BuyingItem | null> => {
    await initializeData() // Ensure data is loaded

    isLoading.value = true
    try {
      const updated = await buyingItemsStorage.updateFromData(updatedItem)
      if (!updated) return null

      const index = buyingItems.value.findIndex((item) => item.id === updatedItem.id)
      if (index !== -1) {
        buyingItems.value[index] = updated
      }
      return updated
    } catch (error) {
      console.error("Failed to update buying item:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteBuyingItem = async (id: string): Promise<boolean> => {
    await initializeData() // Ensure data is loaded

    isLoading.value = true
    try {
      const deleted = await buyingItemsStorage.delete(id)
      if (!deleted) {
        throw new Error("Failed to delete buying item from database")
      }

      const index = buyingItems.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        buyingItems.value.splice(index, 1)
      }
      return true
    } catch (error) {
      console.error("Failed to delete buying item:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const toggleItemBought = async (id: string): Promise<BuyingItem | null> => {
    await initializeData() // Ensure data is loaded

    isLoading.value = true
    try {
      const updated = await buyingItemsStorage.toggleBought(id)
      if (!updated) return null

      const index = buyingItems.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        buyingItems.value[index] = updated
      }
      return updated
    } catch (error) {
      console.error("Failed to toggle bought status:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const clearBoughtItems = async (): Promise<number> => {
    await initializeData() // Ensure data is loaded

    isLoading.value = true
    try {
      const deletedCount = await buyingItemsStorage.clearBoughtItems()
      // Remove bought items from local state
      buyingItems.value = buyingItems.value.filter((item) => !item.isBought)
      return deletedCount
    } catch (error) {
      console.error("Failed to clear bought items:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const getBuyingItem = (id: string): BuyingItem | undefined => {
    return buyingItems.value.find((item) => item.id === id)
  }

  // Filter functions
  const filterByCategory = (category: string) => {
    return buyingItems.value.filter((item) => item.category === category)
  }

  const filterByBuildingId = (buildingId: string) => {
    return buyingItems.value.filter((item) => item.buildingId === buildingId)
  }

  const searchBuyingItems = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return buyingItems.value.filter(
      (item) =>
        item.name.toLowerCase().includes(lowercaseQuery) ||
        item.description?.toLowerCase().includes(lowercaseQuery) ||
        item.category?.toLowerCase().includes(lowercaseQuery) ||
        item.shoppingHint?.toLowerCase().includes(lowercaseQuery) ||
        item.notes?.toLowerCase().includes(lowercaseQuery),
    )
  }

  // Toggle showing bought items
  const toggleShowBoughtItems = () => {
    showBoughtItems.value = !showBoughtItems.value
  }

  return {
    // State
    buyingItems: computed(() => buyingItems.value),
    isLoading: computed(() => isLoading.value),
    isInitialized: computed(() => isInitialized.value),
    showBoughtItems: computed(() => showBoughtItems.value),
    totalItems,
    activeItems,
    boughtItems,
    visibleItems,
    categories,

    // CRUD operations
    createBuyingItem,
    createFromSupplyItem,
    updateBuyingItem,
    deleteBuyingItem,
    toggleItemBought,
    clearBoughtItems,
    getBuyingItem,

    // Filters
    filterByCategory,
    filterByBuildingId,
    searchBuyingItems,
    toggleShowBoughtItems,

    // Manual data refresh
    refreshData: initializeData,
  }
}
