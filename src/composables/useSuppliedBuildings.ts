import { computed, ref } from 'vue'

import type { CreateSuppliedBuilding, SuppliedBuilding, UpdateSuppliedBuilding } from '~/types/suppliedBuilding'

// In-memory storage (as per spec: no storage of data)
const suppliedBuildings = ref<SuppliedBuilding[]>([])

export function useSuppliedBuildings() {
  // Computed values
  const totalBuildings = computed(() => suppliedBuildings.value.length)

  // Generate unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Create a new supplied building
  const createSuppliedBuilding = async (buildingData: CreateSuppliedBuilding): Promise<SuppliedBuilding> => {
    const newBuilding: SuppliedBuilding = {
      id: generateId(),
      name: buildingData.name,
      description: buildingData.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    suppliedBuildings.value.push(newBuilding)
    return newBuilding
  }

  // Update an existing supplied building
  const updateSuppliedBuilding = async (buildingData: UpdateSuppliedBuilding): Promise<SuppliedBuilding> => {
    const index = suppliedBuildings.value.findIndex(building => building.id === buildingData.id)
    if (index === -1) {
      throw new Error(`Building with id ${buildingData.id} not found`)
    }

    const updatedBuilding: SuppliedBuilding = {
      ...suppliedBuildings.value[index],
      name: buildingData.name,
      description: buildingData.description,
      updatedAt: new Date(),
    }

    suppliedBuildings.value[index] = updatedBuilding
    return updatedBuilding
  }

  // Delete a supplied building
  const deleteSuppliedBuilding = async (buildingId: string): Promise<void> => {
    const index = suppliedBuildings.value.findIndex(building => building.id === buildingId)
    if (index === -1) {
      throw new Error(`Building with id ${buildingId} not found`)
    }

    suppliedBuildings.value.splice(index, 1)
  }

  // Get building by ID
  const getBuildingById = (buildingId: string): SuppliedBuilding | undefined => {
    return suppliedBuildings.value.find(building => building.id === buildingId)
  }

  // Search buildings
  const searchSuppliedBuildings = (query: string): SuppliedBuilding[] => {
    if (!query) return suppliedBuildings.value

    const lowercaseQuery = query.toLowerCase()
    return suppliedBuildings.value.filter(building =>
      building.name.toLowerCase().includes(lowercaseQuery) ||
      building.description?.toLowerCase().includes(lowercaseQuery)
    )
  }

  return {
    // State
    suppliedBuildings: computed(() => suppliedBuildings.value),
    totalBuildings,

    // Actions
    createSuppliedBuilding,
    updateSuppliedBuilding,
    deleteSuppliedBuilding,
    getBuildingById,
    searchSuppliedBuildings,
  }
}