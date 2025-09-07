<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-full items-center justify-center p-4 text-center">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="emit('close')"
      ></div>

      <!-- Modal panel -->
      <div
        class="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ isEditing ? m.supply_item_modal.title_edit() : m.supply_item_modal.title_add() }}
          </h3>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
            :title="m.supply_item_modal.close_tooltip()"
          >
            <i class="i-mdi:close text-xl"></i>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name (Required) -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              {{ m.supply_item_modal.name_label() }}
              <span class="text-danger-500">{{ m.supply_item_modal.required_field() }}</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              :placeholder="m.supply_item_modal.name_placeholder()"
              class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              {{ m.supply_item_modal.description_label() }}
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              :placeholder="m.supply_item_modal.description_placeholder()"
              class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          <!-- Quantity (Required) -->
          <div>
            <label for="quantity" class="block text-sm font-medium text-gray-700 mb-2">
              {{ m.supply_item_modal.quantity_label() }}
              <span class="text-danger-500">{{ m.supply_item_modal.required_field() }}</span>
              <button
                type="button"
                @click="showQuantityHelp = !showQuantityHelp"
                class="ml-1 text-gray-400 hover:text-gray-600 w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
                :title="m.supply_item_modal.quantity_help()"
              >
                <i class="i-mdi:help-circle-outline text-xs"></i>
              </button>
            </label>
            <div v-if="showQuantityHelp" class="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-2">
              {{ m.supply_item_modal.quantity_help() }}
            </div>
            <input
              id="quantity"
              v-model.number="form.quantity"
              type="number"
              min="0"
              required
              :placeholder="m.supply_item_modal.quantity_placeholder()"
              class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <!-- Category -->
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
              {{ m.supply_item_modal.category_label() }}
            </label>
            <div class="space-y-2">
              <!-- Category selector and custom input row -->
              <div class="flex space-x-2">
                <select
                  id="category"
                  v-model="form.category"
                  :class="categorySelectMode ? 'flex-1' : 'w-36 flex-shrink-0'"
                  class="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  @change="handleCategoryChange"
                >
                  <option value="">{{ m.supply_item_modal.category_placeholder() }}</option>
                  <option value="custom">{{ m.supply_item_modal.category_custom() }}</option>
                  <option v-for="category in availableCategories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
                <!-- Inline custom input when custom is selected -->
                <template v-if="!categorySelectMode">
                  <input
                    v-model="customCategory"
                    type="text"
                    :placeholder="m.supply_item_modal.category_custom_placeholder()"
                    class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    @keyup.enter="handleCustomCategory"
                  />
                  <button
                    type="button"
                    @click="handleCustomCategory"
                    :disabled="!customCategory.trim()"
                    class="bg-primary-100 hover:bg-primary-200 disabled:bg-gray-50 disabled:text-gray-400 text-primary-700 px-3 py-2 rounded-lg transition-colors flex items-center justify-center w-10 h-10 cursor-pointer disabled:cursor-not-allowed"
                    title="Save custom category"
                  >
                    <i class="i-mdi:check text-lg"></i>
                  </button>
                  <button
                    type="button"
                    @click="cancelCustomCategory"
                    class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center justify-center w-10 h-10 cursor-pointer"
                    title="Cancel custom category creation"
                  >
                    <i class="i-mdi:close text-lg"></i>
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- Storage Room -->
          <div>
            <label for="storage-room" class="block text-sm font-medium text-gray-700 mb-2">
              {{ m.supply_item_modal.storage_room_label() }}
            </label>
            <div class="space-y-2">
              <!-- Storage room selector and custom input row -->
              <div class="flex space-x-2">
                <select
                  id="storage-room"
                  v-model="form.storageRoom"
                  :class="storageSelectMode ? 'flex-1' : 'w-36 flex-shrink-0'"
                  class="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  @change="handleStorageChange"
                >
                  <option value="">{{ m.supply_item_modal.storage_room_placeholder() }}</option>
                  <option value="custom">{{ m.supply_item_modal.storage_room_custom() }}</option>
                  <option v-for="room in availableStorageRooms" :key="room" :value="room">
                    {{ room }}
                  </option>
                </select>
                <!-- Inline custom input when custom is selected -->
                <template v-if="!storageSelectMode">
                  <input
                    v-model="customStorageRoom"
                    type="text"
                    :placeholder="m.supply_item_modal.storage_room_custom_placeholder()"
                    class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    @keyup.enter="handleCustomStorageRoom"
                  />
                  <button
                    type="button"
                    @click="handleCustomStorageRoom"
                    :disabled="!customStorageRoom.trim()"
                    class="bg-primary-100 hover:bg-primary-200 disabled:bg-gray-50 disabled:text-gray-400 text-primary-700 px-3 py-2 rounded-lg transition-colors flex items-center justify-center w-10 h-10 cursor-pointer disabled:cursor-not-allowed"
                    title="Save custom storage room"
                  >
                    <i class="i-mdi:check text-lg"></i>
                  </button>
                  <button
                    type="button"
                    @click="cancelCustomStorageRoom"
                    class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center justify-center w-10 h-10 cursor-pointer"
                    title="Cancel custom storage room creation"
                  >
                    <i class="i-mdi:close text-lg"></i>
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- Shopping Hint -->
          <div>
            <label for="shopping-hint" class="block text-sm font-medium text-gray-700 mb-2">
              {{ m.supply_item_modal.shopping_hint_label() }}
              <button
                type="button"
                @click="showShoppingHintHelp = !showShoppingHintHelp"
                class="ml-1 text-gray-400 hover:text-gray-600 w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
                :title="m.supply_item_modal.shopping_hint_help()"
              >
                <i class="i-mdi:help-circle-outline text-xs"></i>
              </button>
            </label>
            <div
              v-if="showShoppingHintHelp"
              class="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-2"
            >
              {{ m.supply_item_modal.shopping_hint_help() }}
            </div>
            <textarea
              id="shopping-hint"
              v-model="form.shoppingHint"
              rows="2"
              :placeholder="m.supply_item_modal.shopping_hint_placeholder()"
              class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          <!-- Preferred Brands -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ m.supply_item_modal.preferred_brands_label() }}
              <button
                type="button"
                @click="showBrandsHelp = !showBrandsHelp"
                class="ml-1 text-gray-400 hover:text-gray-600 w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
                :title="m.supply_item_modal.preferred_brands_help()"
              >
                <i class="i-mdi:help-circle-outline text-xs"></i>
              </button>
            </label>
            <div v-if="showBrandsHelp" class="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-2">
              {{ m.supply_item_modal.preferred_brands_help() }}
            </div>
            <div class="space-y-2">
              <!-- Existing brands -->
              <div
                v-if="form.preferredBrands && form.preferredBrands.length > 0"
                class="flex flex-wrap gap-2"
              >
                <div
                  v-for="(brand, index) in form.preferredBrands"
                  :key="index"
                  class="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  <span>{{ brand }}</span>
                  <button
                    type="button"
                    @click="removeBrand(index)"
                    class="ml-2 text-gray-400 hover:text-gray-600 w-4 h-4 flex items-center justify-center cursor-pointer"
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
                  :placeholder="m.supply_item_modal.preferred_brands_placeholder()"
                  class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  @keyup.enter="addBrand"
                />
                <button
                  type="button"
                  @click="addBrand"
                  :disabled="!newBrand.trim()"
                  class="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center justify-center w-10 h-10 cursor-pointer disabled:cursor-not-allowed"
                >
                  <i class="i-mdi:plus text-lg"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <BaseButton
              variant="secondary"
              @click="emit('close')"
            >
              {{ m.supply_item_modal.cancel() }}
            </BaseButton>
            <BaseButton
              variant="primary"
              type="submit"
            >
              {{
                isEditing ? m.supply_item_modal.update_item() : m.supply_item_modal.create_item()
              }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"

import BaseButton from "~/components/ui/BaseButton.vue"
import { useI18n } from "~/composables/useI18n"
import type { CreateSupplyItem, SupplyItem, UpdateSupplyItem } from "~/types/supply"
import { COMMON_CATEGORIES, COMMON_STORAGE_ROOMS } from "~/types/supply"

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
  name: "",
  description: "",
  quantity: 1,
  category: "",
  storageRoom: "",
  shoppingHint: "",
  preferredBrands: [],
})

const newBrand = ref("")
const categorySelectMode = ref(true)
const storageSelectMode = ref(true)
const customCategory = ref("")
const customStorageRoom = ref("")

// Help tooltip visibility state
const showQuantityHelp = ref(false)
const showShoppingHintHelp = ref(false)
const showBrandsHelp = ref(false)

// Initialize i18n
const { m } = useI18n()

// Computed
const isEditing = computed(() => !!props.item)

// Include current custom values in dropdown options
const availableCategories = computed(() => {
  const categories = [...COMMON_CATEGORIES] as string[]
  // Add current category if it's not in common categories and not empty
  if (form.category && !categories.includes(form.category)) {
    categories.push(form.category)
  }
  return categories
})

const availableStorageRooms = computed(() => {
  const rooms = [...COMMON_STORAGE_ROOMS] as string[]
  // Add current storage room if it's not in common rooms and not empty
  if (form.storageRoom && !rooms.includes(form.storageRoom)) {
    rooms.push(form.storageRoom)
  }
  return rooms
})

// Methods
const addBrand = () => {
  const brand = newBrand.value.trim()
  if (brand && !form.preferredBrands?.includes(brand)) {
    if (!form.preferredBrands) form.preferredBrands = []
    form.preferredBrands.push(brand)
    newBrand.value = ""
  }
}

const removeBrand = (index: number) => {
  if (form.preferredBrands) {
    form.preferredBrands.splice(index, 1)
  }
}

const handleCategoryChange = () => {
  categorySelectMode.value = form.category !== "custom"
  if (form.category === "custom") {
    customCategory.value = ""
  }
}

const handleCustomCategory = () => {
  const category = customCategory.value.trim()
  if (category) {
    form.category = category
    categorySelectMode.value = true
    customCategory.value = ""
  }
}

const cancelCustomCategory = () => {
  form.category = ""
  categorySelectMode.value = true
  customCategory.value = ""
}

const handleStorageChange = () => {
  storageSelectMode.value = form.storageRoom !== "custom"
  if (form.storageRoom === "custom") {
    customStorageRoom.value = ""
  }
}

const handleCustomStorageRoom = () => {
  const room = customStorageRoom.value.trim()
  if (room) {
    form.storageRoom = room
    storageSelectMode.value = true
    customStorageRoom.value = ""
  }
}

const cancelCustomStorageRoom = () => {
  form.storageRoom = ""
  storageSelectMode.value = true
  customStorageRoom.value = ""
}

const handleSubmit = () => {
  // Validate required fields
  const trimmedName = form.name?.trim()
  if (!trimmedName) {
    alert(m.supply_item_modal.validation.name_required())
    return
  }

  if (form.quantity < 0) {
    alert(m.supply_item_modal.validation.quantity_negative())
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
    preferredBrands: form.preferredBrands?.filter((brand) => brand.trim()) || undefined,
  }

  if (isEditing.value && props.item) {
    // Include ID for updates
    const updateData: UpdateSupplyItem = {
      id: props.item.id,
      ...itemData,
    }
    emit("save", updateData)
  } else {
    emit("save", itemData)
  }
}

// Initialize form with existing item data
onMounted(() => {
  if (props.item) {
    Object.assign(form, {
      name: props.item.name,
      description: props.item.description || "",
      quantity: props.item.quantity,
      category: props.item.category || "",
      storageRoom: props.item.storageRoom || "",
      shoppingHint: props.item.shoppingHint || "",
      preferredBrands: [...(props.item.preferredBrands || [])],
    })

    // Check if existing category/storage room are custom (not in predefined lists)
    // Custom values will be included in the dropdown via computed properties
    // so we keep select mode active
    categorySelectMode.value = true
    storageSelectMode.value = true
  }
})
</script>
