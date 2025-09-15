<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 sm:h-16 sm:py-0"
        >
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
            {{ m.supplied_buildings_title() }}
          </h2>
          <BaseButton variant="primary" icon="i-mdi:plus" @click="showCreateModal = true">
            {{ m.supplied_buildings_add_building() }}
          </BaseButton>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Stats & Search -->
      <div class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <!-- Stats Card -->
          <StatsCard
            :title="m.supplied_buildings_total_buildings()"
            :value="totalBuildings"
            icon="i-mdi:office-building"
            icon-color="primary"
          />

          <!-- Search -->
          <div class="md:col-span-2">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="i-mdi:magnify text-gray-400"></i>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="m.supplied_buildings_search_placeholder()"
                class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Buildings Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BuildingCard
          v-for="building in filteredBuildings"
          :key="building.id"
          :building="building"
          :supply-count="getSupplyCount(building.id)"
          :supplies-count-label="m.supplied_buildings_supplies_count()"
          :manage-supplies-label="m.supplied_buildings_manage_supplies()"
          @view-supplies="viewSupplies"
          @edit="editBuilding"
          @delete="confirmDelete"
        />
      </div>

      <!-- Empty State -->
      <EmptyState
        v-if="filteredBuildings.length === 0"
        icon="i-mdi:office-building"
        :title="
          searchQuery
            ? m.supplied_buildings_empty_state_no_buildings_found_title()
            : m.supplied_buildings_empty_state_no_buildings_title()
        "
        :description="
          searchQuery
            ? m.supplied_buildings_empty_state_no_buildings_found_description()
            : m.supplied_buildings_empty_state_no_buildings_description()
        "
        :action-label="!searchQuery ? m.supplied_buildings_add_first_building() : undefined"
        @action="showCreateModal = true"
      />
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
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import DeleteConfirmationModal from "~/components/DeleteConfirmationModal.vue"
import SuppliedBuildingModal from "~/components/SuppliedBuildingModal.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import BuildingCard from "~/components/ui/BuildingCard.vue"
import EmptyState from "~/components/ui/EmptyState.vue"
import StatsCard from "~/components/ui/StatsCard.vue"
import { useI18n } from "~/composables/useI18n"
import { useSuppliedBuildings } from "~/composables/useSuppliedBuildings"
import { useSupplyItems } from "~/composables/useSupplyItems"
import { useSelectedBuildingStore } from "~/stores/selectedBuilding"
import type {
  CreateSuppliedBuilding,
  SuppliedBuilding,
  UpdateSuppliedBuilding,
} from "~/types/suppliedBuilding"

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
const searchQuery = ref("")

// Computed
const filteredBuildings = computed(() => {
  if (searchQuery.value) {
    return searchSuppliedBuildings(searchQuery.value)
  }
  return suppliedBuildings.value
})

// Get supply count for a building
const getSupplyCount = (buildingId: string): number => {
  return supplyItems.value.filter((item) => item.buildingId === buildingId).length
}

// Methods
const viewSupplies = (building: SuppliedBuilding) => {
  // Store the selected building
  selectedBuildingStore.setSelectedBuilding(building)

  // Navigate to supply configuration with building filter
  router.push({
    name: "SupplyConfiguration",
    query: { buildingId: building.id },
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
    console.error("Failed to save building:", error)
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
    console.error("Failed to delete building:", error)
  }
}
</script>
