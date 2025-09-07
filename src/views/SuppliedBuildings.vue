<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 sm:h-16 sm:py-0"
        >
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
            {{ m.supplied_buildings.title() }}
          </h2>
          <button
            @click="showCreateModal = true"
            class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <i class="i-mdi:plus text-lg"></i>
            <span>{{ m.supplied_buildings.add_building() }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Stats & Search -->
      <div class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <!-- Stats Card -->
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <div class="flex items-center">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-600">{{ m.supplied_buildings.total_buildings() }}</p>
                <p class="text-2xl font-bold text-gray-900">{{ totalBuildings }}</p>
              </div>
              <div class="ml-4">
                <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <i class="i-mdi:office-building text-primary-600"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Search -->
          <div class="md:col-span-2">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="i-mdi:magnify text-gray-400"></i>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="m.supplied_buildings.search_placeholder()"
                class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Buildings Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="building in filteredBuildings"
          :key="building.id"
          class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="p-6">
            <!-- Building Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ building.name }}</h3>
                <p v-if="building.description" class="text-sm text-gray-600 mb-2">
                  {{ building.description }}
                </p>
              </div>
              <div class="ml-4 flex space-x-1">
                <button
                  @click="viewSupplies(building)"
                  class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center w-8 h-8 cursor-pointer"
                  title="View supplies"
                >
                  <i class="i-mdi:package-variant text-lg"></i>
                </button>
                <button
                  @click="editBuilding(building)"
                  class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center w-8 h-8 cursor-pointer"
                  title="Edit building"
                >
                  <i class="i-mdi:pencil text-lg"></i>
                </button>
                <button
                  @click="confirmDelete(building)"
                  class="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors flex items-center justify-center w-8 h-8 cursor-pointer"
                  title="Delete building"
                >
                  <i class="i-mdi:delete text-lg"></i>
                </button>
              </div>
            </div>

            <!-- Building Details -->
            <div class="space-y-3">
              <!-- Supply Count -->
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">{{ m.supplied_buildings.supplies_count() }}</span>
                <span class="text-lg font-bold text-primary-600">{{ getSupplyCount(building.id) }}</span>
              </div>

              <!-- View Supplies Button -->
              <button
                @click="viewSupplies(building)"
                class="w-full mt-4 bg-primary-50 hover:bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
              >
                {{ m.supplied_buildings.manage_supplies() }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredBuildings.length === 0" class="text-center py-12">
        <div
          class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4"
        >
          <i class="i-mdi:office-building text-gray-400 text-4xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ searchQuery ? m.supplied_buildings.empty_state.no_buildings_found_title() : m.supplied_buildings.empty_state.no_buildings_title() }}
        </h3>
        <p class="text-gray-600 mb-6">
          {{ searchQuery ? m.supplied_buildings.empty_state.no_buildings_found_description() : m.supplied_buildings.empty_state.no_buildings_description() }}
        </p>
        <button
          v-if="!searchQuery"
          @click="showCreateModal = true"
          class="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium cursor-pointer"
        >
          {{ m.supplied_buildings.add_first_building() }}
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <SuppliedBuildingModal
      v-if="showCreateModal || editingBuilding"
      :building="editingBuilding"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      v-if="buildingToDelete"
      :item-name="buildingToDelete.name"
      @confirm="handleDelete"
      @cancel="buildingToDelete = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import DeleteConfirmationModal from '~/components/DeleteConfirmationModal.vue'
import SuppliedBuildingModal from '~/components/SuppliedBuildingModal.vue'
import { useI18n } from '~/composables/useI18n'
import { useSuppliedBuildings } from '~/composables/useSuppliedBuildings'
import { useSupplyItems } from '~/composables/useSupplyItems'
import { useSelectedBuildingStore } from '~/stores/selectedBuilding'
import type { CreateSuppliedBuilding, SuppliedBuilding, UpdateSuppliedBuilding } from '~/types/suppliedBuilding'

const router = useRouter()
const { m } = useI18n()
const selectedBuildingStore = useSelectedBuildingStore()
const {
  suppliedBuildings,
  totalBuildings,
  createSuppliedBuilding,
  updateSuppliedBuilding,
  deleteSuppliedBuilding,
  searchSuppliedBuildings,
} = useSuppliedBuildings()

const { supplyItems } = useSupplyItems()

// Local state
const showCreateModal = ref(false)
const editingBuilding = ref<SuppliedBuilding | null>(null)
const buildingToDelete = ref<SuppliedBuilding | null>(null)
const searchQuery = ref('')

// Computed
const filteredBuildings = computed(() => {
  if (searchQuery.value) {
    return searchSuppliedBuildings(searchQuery.value)
  }
  return suppliedBuildings.value
})

// Get supply count for a building
const getSupplyCount = (buildingId: string): number => {
  return supplyItems.value.filter(item => item.buildingId === buildingId).length
}

// Methods
const viewSupplies = (building: SuppliedBuilding) => {
  // Store the selected building
  selectedBuildingStore.setSelectedBuilding(building)
  
  // Navigate to supply configuration with building filter
  router.push({
    name: 'SupplyConfiguration',
    query: { buildingId: building.id }
  })
}

const editBuilding = (building: SuppliedBuilding) => {
  editingBuilding.value = building
}

const confirmDelete = (building: SuppliedBuilding) => {
  buildingToDelete.value = building
}

const closeModal = () => {
  showCreateModal.value = false
  editingBuilding.value = null
}

const handleSave = async (buildingData: CreateSuppliedBuilding | UpdateSuppliedBuilding) => {
  try {
    if (editingBuilding.value) {
      // Update existing building
      const updatedBuilding = await updateSuppliedBuilding(buildingData as UpdateSuppliedBuilding)
      // Update the selected building store if this was the selected building
      selectedBuildingStore.updateSelectedBuilding(updatedBuilding)
    } else {
      // Create new building
      await createSuppliedBuilding(buildingData as CreateSuppliedBuilding)
    }
    closeModal()
  } catch (error) {
    console.error('Failed to save building:', error)
  }
}

const handleDelete = async () => {
  if (!buildingToDelete.value) return

  try {
    const buildingId = buildingToDelete.value.id
    await deleteSuppliedBuilding(buildingId)
    
    // Clear selected building if it was the deleted one
    if (selectedBuildingStore.selectedBuildingId === buildingId) {
      selectedBuildingStore.clearSelectedBuilding()
    }
    
    buildingToDelete.value = null
  } catch (error) {
    console.error('Failed to delete building:', error)
  }
}
</script>