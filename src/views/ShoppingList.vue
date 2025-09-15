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
                {{ m.shopping_list_title() }}
              </h1>
              <p class="text-sm text-gray-600 mt-1">
                {{ m.shopping_list_description() }}
              </p>
            </div>
          </div>
          <Button @click="showCreateModal = true">
            <i class="i-mdi:plus mr-2"></i>
            <span class="hidden sm:inline">{{ m.shopping_list_add_item() }}</span>
            <span class="sm:hidden">Add</span>
          </Button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Controls Bar -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-center justify-between">
          <!-- Search -->
          <div class="flex-1 min-w-[200px] max-w-md">
            <div class="relative">
              <i
                class="i-mdi:magnify absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              ></i>
              <Input
                v-model="searchQuery"
                :placeholder="m.shopping_list_search_placeholder()"
                class="pl-10"
              />
            </div>
          </div>

          <!-- Filters -->
          <div class="flex gap-2">
            <!-- Category Filter -->
            <Select v-model="selectedCategory">
              <SelectTrigger class="w-[180px]">
                <SelectValue :placeholder="m.shopping_list_all_categories()" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{{ m.shopping_list_all_categories() }}</SelectItem>
                <SelectItem v-for="category in categories" :key="category" :value="category || ''">
                  {{ category }}
                </SelectItem>
              </SelectContent>
            </Select>

            <!-- Building Filter -->
            <Select v-model="selectedBuilding">
              <SelectTrigger class="w-[180px]">
                <SelectValue :placeholder="m.shopping_list_all_buildings()" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{{ m.shopping_list_all_buildings() }}</SelectItem>
                <SelectItem v-for="building in buildings" :key="building.id" :value="building.id">
                  {{ building.name }}
                </SelectItem>
              </SelectContent>
            </Select>

            <!-- Show/Hide Bought Toggle -->
            <div class="flex items-center space-x-2">
              <Checkbox
                id="show-bought"
                :checked="showBoughtItems"
                @update:checked="toggleShowBoughtItems"
              />
              <Label for="show-bought" class="cursor-pointer">
                {{ m.shopping_list_show_bought_items() }}
              </Label>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          :title="m.shopping_list_total_items()"
          :value="totalItems"
          icon="i-mdi:format-list-bulleted"
          icon-color="primary"
        />
        <StatsCard
          :title="m.shopping_list_to_buy()"
          :value="activeItems.length"
          icon="i-mdi:cart-outline"
          icon-color="warning"
        />
        <StatsCard
          :title="m.shopping_list_bought()"
          :value="boughtItems.length"
          icon="i-mdi:check-circle-outline"
          icon-color="success"
        />
      </div>

      <!-- Items Grid -->
      <div
        v-if="filteredItems.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <BuyingItemCard
          v-for="item in filteredItems"
          :key="item.id"
          :item="item"
          edit-tooltip="Edit item"
          delete-tooltip="Delete item"
          quantity-label="Qty"
          preferred-brands-label="Preferred Brands"
          :building-name="getBuildingName(item.buildingId)"
          @toggle="handleToggle"
          @edit="editItem"
          @delete="confirmDelete"
        />
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else
        icon="i-mdi:cart-off"
        :title="
          searchQuery ||
          (selectedCategory && selectedCategory !== '__all__') ||
          (selectedBuilding && selectedBuilding !== '__all__')
            ? m.shopping_list_empty_state_no_items_found_title()
            : m.shopping_list_empty_state_no_items_title()
        "
        :description="
          searchQuery ||
          (selectedCategory && selectedCategory !== '__all__') ||
          (selectedBuilding && selectedBuilding !== '__all__')
            ? m.shopping_list_empty_state_no_items_found_description()
            : m.shopping_list_empty_state_no_items_description()
        "
        :action-label="
          !searchQuery &&
          (!selectedCategory || selectedCategory === '__all__') &&
          (!selectedBuilding || selectedBuilding === '__all__')
            ? m.shopping_list_empty_state_add_first_item()
            : undefined
        "
        @action="showCreateModal = true"
      />

      <!-- Create/Edit Modal -->
      <BuyingItemModal
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
        @cancel="
          () => {
            itemToDelete = null
            pendingDeleteItem = null
          }
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import BuyingItemModal from "~/components/BuyingItemModal.vue"
import DeleteConfirmationModal from "~/components/DeleteConfirmationModal.vue"
import { Button } from "~/components/ui/button"
import BuyingItemCard from "~/components/ui/BuyingItemCard.vue"
import { Checkbox } from "~/components/ui/checkbox"
import EmptyState from "~/components/ui/EmptyState.vue"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import StatsCard from "~/components/ui/StatsCard.vue"
import { useToast } from "~/components/ui/toast/use-toast"
import { useBuyingItems } from "~/composables/useBuyingItems"
import { useI18n } from "~/composables/useI18n"
import { useSuppliedBuildings } from "~/composables/useSuppliedBuildings"
import { ROUTES } from "~/router/routes"
import type { BuyingItem, CreateBuyingItem, UpdateBuyingItem } from "~/types/buyingItem"

const router = useRouter()
const { m } = useI18n()
const { toast } = useToast()
const { suppliedBuildings } = useSuppliedBuildings()

// Composables
const {
  visibleItems,
  totalItems,
  activeItems,
  boughtItems,
  categories,
  showBoughtItems,
  createBuyingItem,
  updateBuyingItem,
  deleteBuyingItem,
  toggleItemBought,
  clearBoughtItems,
  toggleShowBoughtItems,
  searchBuyingItems,
} = useBuyingItems()

// Local state
const showCreateModal = ref(false)
const editingItem = ref<BuyingItem | null>(null)
const itemToDelete = ref<BuyingItem | null>(null)
const pendingDeleteItem = ref<BuyingItem | null>(null)
const searchQuery = ref("")
const selectedCategory = ref("__all__")
const selectedBuilding = ref("__all__")

// Computed
const buildings = computed(() => {
  return suppliedBuildings.value
})

const filteredItems = computed(() => {
  let items = visibleItems.value

  if (searchQuery.value) {
    items = searchBuyingItems(searchQuery.value)
    if (!showBoughtItems.value) {
      items = items.filter((item) => !item.isBought)
    }
  }

  if (selectedCategory.value && selectedCategory.value !== "__all__") {
    items = items.filter((item) => item.category === selectedCategory.value)
  }

  if (selectedBuilding.value && selectedBuilding.value !== "__all__") {
    items = items.filter((item) => item.buildingId === selectedBuilding.value)
  }

  return items
})

// Methods
const getBuildingName = (buildingId?: string) => {
  if (!buildingId) return undefined
  const building = buildings.value.find((b) => b.id === buildingId)
  return building?.name
}

const editItem = (item: BuyingItem) => {
  editingItem.value = item
}

const confirmDelete = (item: BuyingItem) => {
  pendingDeleteItem.value = item
  itemToDelete.value = item
}

const closeModal = () => {
  showCreateModal.value = false
  editingItem.value = null
}

const handleSave = async (itemData: CreateBuyingItem | UpdateBuyingItem) => {
  try {
    if (editingItem.value) {
      await updateBuyingItem(itemData as UpdateBuyingItem)
    } else {
      await createBuyingItem(itemData as CreateBuyingItem)
    }
    closeModal()
  } catch (error) {
    console.error("Failed to save item:", error)
    toast({
      title: "Error",
      description: "Failed to save item. Please try again.",
      variant: "destructive",
    })
  }
}

const handleDelete = async () => {
  const itemToProcess = itemToDelete.value || pendingDeleteItem.value

  if (!itemToProcess) {
    return
  }

  try {
    await deleteBuyingItem(itemToProcess.id)
    itemToDelete.value = null
    pendingDeleteItem.value = null
  } catch (error) {
    console.error("Failed to delete item:", error)
    toast({
      title: "Error",
      description: "Failed to delete item. Please try again.",
      variant: "destructive",
    })
    itemToDelete.value = null
    pendingDeleteItem.value = null
  }
}

const handleToggle = async (item: BuyingItem) => {
  try {
    await toggleItemBought(item.id)
  } catch (error) {
    console.error("Failed to toggle item:", error)
    toast({
      title: "Error",
      description: "Failed to update item status. Please try again.",
      variant: "destructive",
    })
  }
}

const handleClearBought = async () => {
  const count = boughtItems.value.length
  if (confirm(`Are you sure you want to delete ${count} bought item${count > 1 ? "s" : ""}?`)) {
    try {
      await clearBoughtItems()
      toast({
        title: "Success",
        description: `${count} item${count > 1 ? "s" : ""} cleared successfully`,
      })
    } catch (error) {
      console.error("Failed to clear bought items:", error)
      toast({
        title: "Error",
        description: "Failed to clear bought items. Please try again.",
        variant: "destructive",
      })
    }
  }
}
</script>
