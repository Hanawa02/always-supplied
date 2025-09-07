import { computed, onMounted, ref } from "vue"

import { suppliedBuildingsStorage } from "~/services/suppliedBuildingsStorage"
import type {
  CreateSuppliedBuilding,
  SuppliedBuilding,
  UpdateSuppliedBuilding,
} from "~/types/suppliedBuilding"

// Reactive storage with IndexedDB persistence
const suppliedBuildings = ref<SuppliedBuilding[]>([])
const isLoading = ref(false)
const isInitialized = ref(false)

export function useSuppliedBuildings() {
  // Computed values
  const totalBuildings = computed(() => suppliedBuildings.value.length)

  // Initialize data from storage
  const initializeData = async () => {
    if (isInitialized.value) return
    
    isLoading.value = true
    try {
      const buildings = await suppliedBuildingsStorage.getAll()
      suppliedBuildings.value = buildings
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to load buildings from storage:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Auto-initialize on first access
  onMounted(() => {
    initializeData()
  })

  // Create a new supplied building
  const createSuppliedBuilding = async (
    buildingData: CreateSuppliedBuilding,
  ): Promise<SuppliedBuilding> => {
    await initializeData() // Ensure data is loaded
    
    isLoading.value = true
    try {
      const newBuilding = await suppliedBuildingsStorage.create(buildingData)
      suppliedBuildings.value.push(newBuilding)
      // Sort to maintain alphabetical order
      suppliedBuildings.value.sort((a, b) => a.name.localeCompare(b.name))
      return newBuilding
    } catch (error) {
      console.error('Failed to create building:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Update an existing supplied building
  const updateSuppliedBuilding = async (
    buildingData: UpdateSuppliedBuilding,
  ): Promise<SuppliedBuilding> => {
    await initializeData() // Ensure data is loaded
    
    isLoading.value = true
    try {
      const updatedBuilding = await suppliedBuildingsStorage.updateFromData(buildingData)
      if (!updatedBuilding) {
        throw new Error(`Building with id ${buildingData.id} not found`)
      }

      const index = suppliedBuildings.value.findIndex((building) => building.id === buildingData.id)
      if (index !== -1) {
        suppliedBuildings.value[index] = updatedBuilding
        // Re-sort to maintain alphabetical order
        suppliedBuildings.value.sort((a, b) => a.name.localeCompare(b.name))
      }
      return updatedBuilding
    } catch (error) {
      console.error('Failed to update building:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Delete a supplied building
  const deleteSuppliedBuilding = async (buildingId: string): Promise<void> => {
    await initializeData() // Ensure data is loaded
    
    isLoading.value = true
    try {
      const deleted = await suppliedBuildingsStorage.delete(buildingId)
      if (!deleted) {
        throw new Error(`Building with id ${buildingId} not found`)
      }

      const index = suppliedBuildings.value.findIndex((building) => building.id === buildingId)
      if (index !== -1) {
        suppliedBuildings.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Failed to delete building:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Get building by ID
  const getBuildingById = (buildingId: string): SuppliedBuilding | undefined => {
    return suppliedBuildings.value.find((building) => building.id === buildingId)
  }

  // Get building by ID with async fallback to storage
  const getBuildingByIdAsync = async (buildingId: string): Promise<SuppliedBuilding | undefined> => {
    await initializeData() // Ensure data is loaded
    return getBuildingById(buildingId)
  }

  // Search buildings
  const searchSuppliedBuildings = (query: string): SuppliedBuilding[] => {
    if (!query) return suppliedBuildings.value

    const lowercaseQuery = query.toLowerCase()
    return suppliedBuildings.value.filter(
      (building) =>
        building.name.toLowerCase().includes(lowercaseQuery) ||
        building.description?.toLowerCase().includes(lowercaseQuery),
    )
  }

  // Advanced search with storage fallback
  const searchSuppliedBuildingsAsync = async (query: string): Promise<SuppliedBuilding[]> => {
    await initializeData() // Ensure data is loaded
    return searchSuppliedBuildings(query)
  }

  return {
    // State
    suppliedBuildings: computed(() => suppliedBuildings.value),
    totalBuildings,
    isLoading: computed(() => isLoading.value),
    isInitialized: computed(() => isInitialized.value),

    // Actions
    createSuppliedBuilding,
    updateSuppliedBuilding,
    deleteSuppliedBuilding,
    getBuildingById,
    getBuildingByIdAsync,
    searchSuppliedBuildings,
    searchSuppliedBuildingsAsync,
    
    // Manual data refresh
    refreshData: initializeData,
  }
}
