import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { SuppliedBuilding } from '~/types/suppliedBuilding'

export const useSelectedBuildingStore = defineStore('selectedBuilding', () => {
  // State
  const selectedBuildingId = ref<string | null>(null)
  const selectedBuildingData = ref<SuppliedBuilding | null>(null)

  // Getters
  const hasSelectedBuilding = computed(() => !!selectedBuildingId.value)
  const selectedBuilding = computed(() => selectedBuildingData.value)

  // Actions
  const setSelectedBuilding = (building: SuppliedBuilding) => {
    selectedBuildingId.value = building.id
    selectedBuildingData.value = building
    
    // Persist to localStorage
    localStorage.setItem('selectedBuildingId', building.id)
    localStorage.setItem('selectedBuildingData', JSON.stringify(building))
  }

  const clearSelectedBuilding = () => {
    selectedBuildingId.value = null
    selectedBuildingData.value = null
    
    // Clear from localStorage
    localStorage.removeItem('selectedBuildingId')
    localStorage.removeItem('selectedBuildingData')
  }

  const loadFromStorage = () => {
    try {
      const storedId = localStorage.getItem('selectedBuildingId')
      const storedData = localStorage.getItem('selectedBuildingData')
      
      if (storedId && storedData) {
        selectedBuildingId.value = storedId
        selectedBuildingData.value = JSON.parse(storedData)
      }
    } catch (error) {
      console.warn('Failed to load selected building from localStorage:', error)
      clearSelectedBuilding()
    }
  }

  const updateSelectedBuilding = (updatedBuilding: SuppliedBuilding) => {
    if (selectedBuildingId.value === updatedBuilding.id) {
      selectedBuildingData.value = updatedBuilding
      localStorage.setItem('selectedBuildingData', JSON.stringify(updatedBuilding))
    }
  }

  return {
    // State
    selectedBuildingId: computed(() => selectedBuildingId.value),
    selectedBuilding,
    hasSelectedBuilding,
    
    // Actions
    setSelectedBuilding,
    clearSelectedBuilding,
    loadFromStorage,
    updateSelectedBuilding,
  }
})