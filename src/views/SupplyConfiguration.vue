<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 sm:h-16 sm:py-0"
        >
          <div class="flex items-center space-x-3">
            <button
              @click="router.push(ROUTES.SUPPLIED_BUILDINGS.path)"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
              title="Back to Buildings"
            >
              <i class="i-mdi:arrow-left text-xl"></i>
            </button>
            <div>
              <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
                {{ m.supply_configuration.title() }}
              </h1>
              <p v-if="selectedBuilding" class="text-sm text-gray-600 mt-1">
                {{ selectedBuilding.name }}
              </p>
            </div>
          </div>
          <BaseButton variant="primary" icon="i-mdi:plus" @click="showCreateModal = true">
            <span class="hidden sm:inline">{{ m.supply_configuration.add_supply_item() }}</span>
            <span class="sm:hidden">{{ m.supply_configuration.add_item_short() }}</span>
          </BaseButton>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Stats & Filters -->
      <div class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <!-- Stats Card -->
          <StatsCard
            :title="m.supply_configuration.total_items()"
            :value="totalItems"
            icon="i-mdi:format-list-numbered"
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
                :placeholder="m.supply_configuration.search_placeholder()"
                class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <!-- Category Filter -->
          <div>
            <select
              v-model="selectedCategory"
              class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">{{ m.supply_configuration.all_categories() }}</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Supply Items Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SupplyItemCard
          v-for="item in filteredItems"
          :key="item.id"
          :item="item"
          :edit-tooltip="m.supply_configuration.item.edit_tooltip()"
          :delete-tooltip="m.supply_configuration.item.delete_tooltip()"
          :add-to-shopping-list-tooltip="'Add to shopping list'"
          :quantity-label="m.supply_configuration.item.quantity()"
          :category-label="m.supply_configuration.item.category()"
          :storage-label="m.supply_configuration.item.storage()"
          :preferred-brands-label="m.supply_configuration.item.preferred_brands()"
          @edit="editItem"
          @delete="confirmDelete"
          @add-to-shopping-list="handleAddToShoppingList"
        />
      </div>

      <!-- Empty State -->
      <EmptyState
        v-if="filteredItems.length === 0"
        icon="i-mdi:package-variant-closed"
        :title="
          searchQuery || selectedCategory
            ? m.supply_configuration.empty_state.no_items_found_title()
            : m.supply_configuration.empty_state.no_items_title()
        "
        :description="
          searchQuery || selectedCategory
            ? m.supply_configuration.empty_state.no_items_found_description()
            : m.supply_configuration.empty_state.no_items_description()
        "
        :action-label="
          !searchQuery && !selectedCategory
            ? m.supply_configuration.empty_state.add_first_item()
            : undefined
        "
        @action="showCreateModal = true"
      />
    </div>

    <!-- Create/Edit Modal -->
    <SupplyItemModal
      v-if="showCreateModal || editingItem"
      :item="editingItem"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      v-if="itemToDelete"
      :item-name="itemToDelete.name"
      @confirm="handleDelete"
      @cancel="() => { itemToDelete = null; pendingDeleteItem = null }"
    />

    <!-- Add to Shopping List Modal -->
    <BuyingItemModal
      v-if="showAddToBuyingListModal && supplyItemToAddToBuyingList"
      :item="null"
      :supply-item="supplyItemToAddToBuyingList"
      @close="() => { showAddToBuyingListModal = false; supplyItemToAddToBuyingList = null }"
      @save="handleSaveToBuyingList"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

import BuyingItemModal from "~/components/BuyingItemModal.vue"
import DeleteConfirmationModal from "~/components/DeleteConfirmationModal.vue"
import SupplyItemModal from "~/components/SupplyItemModal.vue"
import BaseButton from "~/components/ui/BaseButton.vue"
import EmptyState from "~/components/ui/EmptyState.vue"
import StatsCard from "~/components/ui/StatsCard.vue"
import SupplyItemCard from "~/components/ui/SupplyItemCard.vue"
import { useToast } from "~/components/ui/toast/use-toast"
import { useBuyingItems } from "~/composables/useBuyingItems"
import { useI18n } from "~/composables/useI18n"
import { useSuppliedBuildings } from "~/composables/useSuppliedBuildings"
import { useSupplyItems } from "~/composables/useSupplyItems"
import { ROUTES } from "~/router/routes"
import { useSelectedBuildingStore } from "~/stores/selectedBuilding"
import type { CreateSupplyItem, SupplyItem, UpdateSupplyItem } from "~/types/supply"

const {
  supplyItems,
  totalItems,
  categories,
  createSupplyItem,
  updateSupplyItem,
  deleteSupplyItem,
  searchSupplyItems,
} = useSupplyItems()

const { createFromSupplyItem } = useBuyingItems()

const { getBuildingById } = useSuppliedBuildings()
const selectedBuildingStore = useSelectedBuildingStore()
const { m } = useI18n()
const { toast } = useToast()
const route = useRoute()
const router = useRouter()

// Check for required building selection
const selectedBuildingId = computed(() => {
  // First priority: query parameter
  const queryId = route.query.buildingId as string | undefined
  if (queryId) return queryId

  // Second priority: selected building from store
  return selectedBuildingStore.selectedBuildingId
})

const selectedBuilding = computed(() => {
  if (!selectedBuildingId.value) return null
  return getBuildingById(selectedBuildingId.value)
})

// Redirect to buildings page if no building is selected
onMounted(() => {
  // Load selected building from storage if not already loaded
  selectedBuildingStore.loadFromStorage()

  // If we still don't have a selected building, redirect
  if (!selectedBuildingId.value) {
    router.replace(ROUTES.SUPPLIED_BUILDINGS.path)
  } else if (!route.query.buildingId && selectedBuildingStore.selectedBuildingId) {
    // If we have a selected building but no query param, update the URL
    router.replace({
      name: route.name,
      query: { ...route.query, buildingId: selectedBuildingStore.selectedBuildingId },
    })
  }
})

// Local state
const showCreateModal = ref(false)
const editingItem = ref<SupplyItem | null>(null)
const itemToDelete = ref<SupplyItem | null>(null)
const pendingDeleteItem = ref<SupplyItem | null>(null) // Store item being deleted
const searchQuery = ref("")
const selectedCategory = ref("")
const supplyItemToAddToBuyingList = ref<SupplyItem | null>(null)
const showAddToBuyingListModal = ref(false)

// Computed
const filteredItems = computed(() => {
  let items = supplyItems.value

  // Filter by selected building
  if (selectedBuildingId.value) {
    items = items.filter((item) => item.buildingId === selectedBuildingId.value)
  }

  if (searchQuery.value) {
    items = searchSupplyItems(searchQuery.value)
  }

  if (selectedCategory.value) {
    items = items.filter((item) => item.category === selectedCategory.value)
  }

  return items
})

// Methods
const editItem = (item: SupplyItem) => {
  editingItem.value = item
}

const confirmDelete = (item: SupplyItem) => {
  pendingDeleteItem.value = item // Store the item separately
  itemToDelete.value = item
}

const closeModal = () => {
  showCreateModal.value = false
  editingItem.value = null
}

const handleSave = async (itemData: CreateSupplyItem | UpdateSupplyItem) => {
  try {
    if (editingItem.value) {
      // Update existing item
      await updateSupplyItem(itemData as UpdateSupplyItem)
    } else {
      // Create new item - add building ID
      const createData: CreateSupplyItem = {
        ...(itemData as CreateSupplyItem),
        buildingId: selectedBuildingId.value!,
      }
      await createSupplyItem(createData)
    }
    closeModal()
    toast({
      title: "Success",
      description: editingItem.value ? "Item updated successfully" : "Item created successfully",
    })
  } catch (error) {
    console.error("Failed to save item:", error)
    toast({
      title: "Error",
      description: "Failed to save item. Please try again.",
      variant: "destructive",
    })
  }
}

const handleAddToShoppingList = (item: SupplyItem) => {
  supplyItemToAddToBuyingList.value = item
  showAddToBuyingListModal.value = true
}

const handleSaveToBuyingList = async (buyingItemData: { quantity: number }) => {
  try {
    await createFromSupplyItem(supplyItemToAddToBuyingList.value!, buyingItemData.quantity)
    showAddToBuyingListModal.value = false
    supplyItemToAddToBuyingList.value = null
    toast({
      title: "Success",
      description: "Item added to shopping list!",
    })
  } catch (error) {
    console.error("Failed to add item to shopping list:", error)
    toast({
      title: "Error",
      description: "Failed to add item to shopping list. Please try again.",
      variant: "destructive",
    })
  }
}

const handleDelete = async () => {
  // Use pendingDeleteItem as fallback if itemToDelete is null
  const itemToProcess = itemToDelete.value || pendingDeleteItem.value
  
  if (!itemToProcess) {
    return
  }

  const itemId = itemToProcess.id
  
  try {
    const deleted = await deleteSupplyItem(itemId)
    if (deleted) {
      itemToDelete.value = null
      pendingDeleteItem.value = null
      toast({
        title: "Success",
        description: "Item deleted successfully",
      })
    } else {
      console.error("Failed to delete item - deletion returned false")
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      })
      itemToDelete.value = null
      pendingDeleteItem.value = null
    }
  } catch (error) {
    console.error("Failed to delete item:", error)
    toast({
      title: "Error",
      description: `Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive",
    })
    itemToDelete.value = null
    pendingDeleteItem.value = null
  }
}
</script>
