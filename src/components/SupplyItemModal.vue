<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-full items-center justify-center p-4 text-center">
      <!-- Background overlay -->
      <div 
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="emit('close')"
      ></div>

      <!-- Modal panel -->
      <div class="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ isEditing ? 'Edit Supply Item' : 'Add Supply Item' }}
            </h3>
            <button
              @click="emit('close')"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i class="i-mdi:close text-xl"></i>
            </button>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name (Required) -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Name <span class="text-danger-500">*</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              placeholder="e.g., Paper Towels"
              class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              placeholder="Brief description of the item..."
              class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          <!-- Quantity (Required) -->
          <div>
            <label for="quantity" class="block text-sm font-medium text-gray-700 mb-2">
              Quantity <span class="text-danger-500">*</span>
            </label>
            <input
              id="quantity"
              v-model.number="form.quantity"
              type="number"
              min="0"
              required
              placeholder="0"
              class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
          </div>

          <!-- Category and Storage Room -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Category -->
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div class="space-y-2">
                <select
                  id="category"
                  v-model="form.category"
                  class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  @change="categorySelectMode = form.category !== 'custom'"
                >
                  <option value="">Select category</option>
                  <option v-for="category in COMMON_CATEGORIES" :key="category" :value="category">
                    {{ category }}
                  </option>
                  <option value="custom">+ Add custom category</option>
                </select>
                <input
                  v-if="!categorySelectMode"
                  v-model="customCategory"
                  type="text"
                  placeholder="Enter custom category..."
                  class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  @blur="handleCustomCategory"
                  @keyup.enter="handleCustomCategory"
                >
              </div>
            </div>

            <!-- Storage Room -->
            <div>
              <label for="storage-room" class="block text-sm font-medium text-gray-700 mb-2">
                Storage Room
              </label>
              <div class="space-y-2">
                <select
                  id="storage-room"
                  v-model="form.storageRoom"
                  class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  @change="storageSelectMode = form.storageRoom !== 'custom'"
                >
                  <option value="">Select storage room</option>
                  <option v-for="room in COMMON_STORAGE_ROOMS" :key="room" :value="room">
                    {{ room }}
                  </option>
                  <option value="custom">+ Add custom storage room</option>
                </select>
                <input
                  v-if="!storageSelectMode"
                  v-model="customStorageRoom"
                  type="text"
                  placeholder="Enter custom storage room..."
                  class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  @blur="handleCustomStorageRoom"
                  @keyup.enter="handleCustomStorageRoom"
                >
              </div>
            </div>
          </div>

          <!-- Shopping Hint -->
          <div>
            <label for="shopping-hint" class="block text-sm font-medium text-gray-700 mb-2">
              Shopping Hint
            </label>
            <textarea
              id="shopping-hint"
              v-model="form.shoppingHint"
              rows="2"
              placeholder="Any special instructions for shopping..."
              class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          <!-- Preferred Brands -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Preferred Brands
            </label>
            <div class="space-y-2">
              <!-- Existing brands -->
              <div v-if="form.preferredBrands && form.preferredBrands.length > 0" class="flex flex-wrap gap-2">
                <div
                  v-for="(brand, index) in form.preferredBrands"
                  :key="index"
                  class="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  <span>{{ brand }}</span>
                  <button
                    type="button"
                    @click="removeBrand(index)"
                    class="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <i class="i-mdi:close text-sm"></i>
                  </button>
                </div>
              </div>
              
              <!-- Add new brand -->
              <div class="flex space-x-2">
                <input
                  v-model="newBrand"
                  type="text"
                  placeholder="Add a brand..."
                  class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  @keyup.enter="addBrand"
                >
                <button
                  type="button"
                  @click="addBrand"
                  :disabled="!newBrand.trim()"
                  class="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                  <i class="i-mdi:plus text-lg"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              {{ isEditing ? 'Update Item' : 'Create Item' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

import { COMMON_CATEGORIES, COMMON_STORAGE_ROOMS } from '~/types/supply'
import type { SupplyItem, CreateSupplyItem, UpdateSupplyItem } from '~/types/supply'

interface Props {
  item?: SupplyItem | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [item: CreateSupplyItem | UpdateSupplyItem]
}>()

// Form state
const form = reactive<CreateSupplyItem>({
  name: '',
  description: '',
  quantity: 0,
  category: '',
  storageRoom: '',
  shoppingHint: '',
  preferredBrands: [],
})

const newBrand = ref('')
const categorySelectMode = ref(true)
const storageSelectMode = ref(true)
const customCategory = ref('')
const customStorageRoom = ref('')

// Computed
const isEditing = computed(() => !!props.item)

// Methods
const addBrand = () => {
  const brand = newBrand.value.trim()
  if (brand && !form.preferredBrands?.includes(brand)) {
    if (!form.preferredBrands) form.preferredBrands = []
    form.preferredBrands.push(brand)
    newBrand.value = ''
  }
}

const removeBrand = (index: number) => {
  if (form.preferredBrands) {
    form.preferredBrands.splice(index, 1)
  }
}

const handleCustomCategory = () => {
  const category = customCategory.value.trim()
  if (category) {
    form.category = category
    categorySelectMode.value = true
    customCategory.value = ''
  } else {
    form.category = ''
    categorySelectMode.value = true
  }
}

const handleCustomStorageRoom = () => {
  const room = customStorageRoom.value.trim()
  if (room) {
    form.storageRoom = room
    storageSelectMode.value = true
    customStorageRoom.value = ''
  } else {
    form.storageRoom = ''
    storageSelectMode.value = true
  }
}

const handleSubmit = () => {
  // Validate required fields
  const trimmedName = form.name?.trim()
  if (!trimmedName) {
    alert('Item name is required and cannot be empty or just spaces.')
    return
  }

  if (form.quantity < 0) {
    alert('Quantity cannot be negative.')
    return
  }

  const itemData = {
    ...form,
    name: trimmedName, // Use trimmed name
    // Clean up empty strings
    description: form.description?.trim() || undefined,
    category: form.category?.trim() || undefined,
    storageRoom: form.storageRoom?.trim() || undefined,
    shoppingHint: form.shoppingHint?.trim() || undefined,
    preferredBrands: form.preferredBrands?.filter(brand => brand.trim()) || undefined,
  }

  if (isEditing.value && props.item) {
    // Include ID for updates
    const updateData: UpdateSupplyItem = {
      id: props.item.id,
      ...itemData,
    }
    emit('save', updateData)
  } else {
    emit('save', itemData)
  }
}

// Initialize form with existing item data
onMounted(() => {
  if (props.item) {
    Object.assign(form, {
      name: props.item.name,
      description: props.item.description || '',
      quantity: props.item.quantity,
      category: props.item.category || '',
      storageRoom: props.item.storageRoom || '',
      shoppingHint: props.item.shoppingHint || '',
      preferredBrands: [...(props.item.preferredBrands || [])],
    })
    
    // Check if existing category/storage room are custom (not in predefined lists)
    if (props.item.category && !COMMON_CATEGORIES.includes(props.item.category as any)) {
      // This is a custom category, keep it in the form but select mode stays true
      categorySelectMode.value = true
    }
    
    if (props.item.storageRoom && !COMMON_STORAGE_ROOMS.includes(props.item.storageRoom as any)) {
      // This is a custom storage room, keep it in the form but select mode stays true  
      storageSelectMode.value = true
    }
  }
})
</script>