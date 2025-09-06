<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 sm:h-16 sm:py-0">
          <div class="flex items-center">
            <i class="i-mdi:package-variant text-primary-600 text-2xl mr-3"></i>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Supply Configuration</h1>
          </div>
          <button
            @click="showCreateModal = true"
            class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <i class="i-mdi:plus text-lg"></i>
            <span class="hidden sm:inline">Add Supply Item</span>
            <span class="sm:hidden">Add Item</span>
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Stats & Filters -->
      <div class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <!-- Stats Card -->
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <div class="flex items-center">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-600">Total Items</p>
                <p class="text-2xl font-bold text-gray-900">{{ totalItems }}</p>
              </div>
              <div class="ml-4">
                <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <i class="i-mdi:format-list-numbered text-primary-600"></i>
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
                placeholder="Search supply items..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
            </div>
          </div>

          <!-- Category Filter -->
          <div>
            <select
              v-model="selectedCategory"
              class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Supply Items Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="p-6">
            <!-- Item Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ item.name }}</h3>
                <p v-if="item.description" class="text-sm text-gray-600 mb-2">{{ item.description }}</p>
              </div>
              <div class="ml-4 flex space-x-1">
                <button
                  @click="editItem(item)"
                  class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center"
                  title="Edit item"
                >
                  <i class="i-mdi:pencil text-lg"></i>
                </button>
                <button
                  @click="confirmDelete(item)"
                  class="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors flex items-center justify-center"
                  title="Delete item"
                >
                  <i class="i-mdi:delete text-lg"></i>
                </button>
              </div>
            </div>

            <!-- Item Details -->
            <div class="space-y-3">
              <!-- Quantity -->
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Quantity:</span>
                <span class="text-lg font-bold text-primary-600">{{ item.quantity }}</span>
              </div>

              <!-- Category & Storage Room -->
              <div class="grid grid-cols-2 gap-4">
                <div v-if="item.category">
                  <span class="text-xs text-gray-500">Category</span>
                  <div class="bg-primary-50 text-primary-700 px-2 py-1 rounded-full text-xs font-medium mt-1">
                    {{ item.category }}
                  </div>
                </div>
                <div v-if="item.storageRoom">
                  <span class="text-xs text-gray-500">Storage</span>
                  <div class="bg-info-50 text-info-700 px-2 py-1 rounded-full text-xs font-medium mt-1">
                    {{ item.storageRoom }}
                  </div>
                </div>
              </div>

              <!-- Shopping Hint -->
              <div v-if="item.shoppingHint" class="bg-warning-50 p-3 rounded-lg">
                <div class="flex items-start">
                  <i class="i-mdi:lightbulb-outline text-warning-600 text-sm mt-0.5 mr-2 flex-shrink-0"></i>
                  <p class="text-xs text-warning-700">{{ item.shoppingHint }}</p>
                </div>
              </div>

              <!-- Preferred Brands -->
              <div v-if="item.preferredBrands && item.preferredBrands.length > 0">
                <span class="text-xs text-gray-500 mb-2 block">Preferred Brands</span>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="brand in item.preferredBrands"
                    :key="brand"
                    class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    {{ brand }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredItems.length === 0"
        class="text-center py-12"
      >
        <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="i-mdi:package-variant-closed text-gray-400 text-4xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ searchQuery || selectedCategory ? 'No items found' : 'No supply items yet' }}
        </h3>
        <p class="text-gray-600 mb-6">
          {{ searchQuery || selectedCategory ? 'Try adjusting your search or filters.' : 'Start by adding your first supply item.' }}
        </p>
        <button
          v-if="!searchQuery && !selectedCategory"
          @click="showCreateModal = true"
          class="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          Add Your First Item
        </button>
      </div>
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
      @cancel="itemToDelete = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import DeleteConfirmationModal from '~/components/DeleteConfirmationModal.vue'
import SupplyItemModal from '~/components/SupplyItemModal.vue'
import { useSupplyItems } from '~/composables/useSupplyItems'
import type { SupplyItem, CreateSupplyItem, UpdateSupplyItem } from '~/types/supply'

const {
  supplyItems,
  totalItems,
  categories,
  createSupplyItem,
  updateSupplyItem,
  deleteSupplyItem,
  searchSupplyItems,
  filterByCategory,
} = useSupplyItems()

// Local state
const showCreateModal = ref(false)
const editingItem = ref<SupplyItem | null>(null)
const itemToDelete = ref<SupplyItem | null>(null)
const searchQuery = ref('')
const selectedCategory = ref('')

// Computed
const filteredItems = computed(() => {
  let items = supplyItems.value

  if (searchQuery.value) {
    items = searchSupplyItems(searchQuery.value)
  }

  if (selectedCategory.value) {
    items = items.filter(item => item.category === selectedCategory.value)
  }

  return items
})

// Methods
const editItem = (item: SupplyItem) => {
  editingItem.value = item
}

const confirmDelete = (item: SupplyItem) => {
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
      // Create new item
      await createSupplyItem(itemData as CreateSupplyItem)
    }
    closeModal()
  } catch (error) {
    console.error('Failed to save item:', error)
  }
}

const handleDelete = async () => {
  if (!itemToDelete.value) return

  try {
    await deleteSupplyItem(itemToDelete.value.id)
    itemToDelete.value = null
  } catch (error) {
    console.error('Failed to delete item:', error)
  }
}
</script>