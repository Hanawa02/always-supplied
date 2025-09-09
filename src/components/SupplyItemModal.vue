<template>
  <Dialog :open="true" @update:open="(open) => !open && emit('close')">
    <DialogContent class="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {{ isEditing ? m.supply_item_modal_title_edit() : m.supply_item_modal_title_add() }}
        </DialogTitle>
      </DialogHeader>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Name (Required) -->
        <div class="grid gap-2">
          <Label for="name">
            {{ m.supply_item_modal_name_label() }}
            <span class="text-destructive">{{ m.supply_item_modal_required_field() }}</span>
          </Label>
          <Input
            id="name"
            v-model="form.name"
            type="text"
            required
            :placeholder="m.supply_item_modal_name_placeholder()"
            :class="validationErrors.name ? 'border-destructive' : ''"
          />
          <p v-if="validationErrors.name" class="text-sm text-destructive">
            {{ validationErrors.name }}
          </p>
        </div>

        <!-- Description -->
        <div class="grid gap-2">
          <Label for="description">
            {{ m.supply_item_modal_description_label() }}
          </Label>
          <Textarea
            id="description"
            v-model="form.description"
            rows="3"
            :placeholder="m.supply_item_modal_description_placeholder()"
          />
        </div>

        <!-- Quantity (Required) -->
        <div class="grid gap-2">
          <Label for="quantity">
            {{ m.supply_item_modal_quantity_label() }}
            <span class="text-destructive">{{ m.supply_item_modal_required_field() }}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              @click="showQuantityHelp = !showQuantityHelp"
              class="ml-1 h-4 w-4"
              :title="m.supply_item_modal_quantity_help()"
            >
              <i class="i-mdi:help-circle-outline text-xs"></i>
            </Button>
          </Label>
          <div v-if="showQuantityHelp" class="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-2">
            {{ m.supply_item_modal_quantity_help() }}
          </div>
          <Input
            id="quantity"
            v-model.number="form.quantity"
            type="number"
            min="0"
            required
            :placeholder="m.supply_item_modal_quantity_placeholder()"
            :class="validationErrors.quantity ? 'border-destructive' : ''"
          />
          <p v-if="validationErrors.quantity" class="text-sm text-destructive">
            {{ validationErrors.quantity }}
          </p>
        </div>

        <!-- Category -->
        <div class="grid gap-2">
          <Label for="category">
            {{ m.supply_item_modal_category_label() }}
          </Label>
          <div class="space-y-2">
            <!-- Category selector and custom input row -->
            <div class="flex flex-col md:flex-row gap-x-3 gap-y-2">
              <Select :model-value="form.category" @update:model-value="handleCategoryChange">
                <SelectTrigger class="w-full min-w-24">
                  <SelectValue :placeholder="m.supply_item_modal_category_placeholder()" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">{{
                    m.supply_item_modal_category_custom()
                  }}</SelectItem>
                  <SelectItem
                    v-for="category in availableCategories"
                    :key="category"
                    :value="category"
                  >
                    {{ category }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <!-- Inline custom input when custom is selected -->
              <div
                v-if="!categorySelectMode"
                class="flex space-x-2 w-full md:contents md:space-x-0"
              >
                <Input
                  v-model="customCategory"
                  type="text"
                  :placeholder="m.supply_item_modal_category_custom_placeholder()"
                  class="w-full"
                  @keyup.enter="handleCustomCategory"
                />
                <Button
                  type="button"
                  @click="handleCustomCategory"
                  :disabled="!customCategory.trim()"
                  size="icon"
                  variant="secondary"
                  title="Save custom category"
                  class="flex-shrink-0"
                >
                  <i class="i-mdi:check text-lg"></i>
                </Button>
                <Button
                  type="button"
                  @click="cancelCustomCategory"
                  size="icon"
                  variant="outline"
                  title="Cancel custom category creation"
                  class="flex-shrink-0"
                >
                  <i class="i-mdi:close text-lg"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Storage Room -->
        <div class="grid gap-2">
          <Label for="storage-room">
            {{ m.supply_item_modal_storage_room_label() }}
          </Label>
          <div class="space-y-2">
            <!-- Storage room selector and custom input row -->
            <div class="flex flex-col md:flex-row gap-x-3 gap-y-2">
              <Select :model-value="form.storageRoom" @update:model-value="handleStorageChange">
                <SelectTrigger class="w-full min-w-24">
                  <SelectValue :placeholder="m.supply_item_modal_storage_room_placeholder()" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">{{
                    m.supply_item_modal_storage_room_custom()
                  }}</SelectItem>
                  <SelectItem v-for="room in availableStorageRooms" :key="room" :value="room">
                    {{ room }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <!-- Inline custom input when custom is selected -->
              <div v-if="!storageSelectMode" class="flex space-x-2 w-full md:contents md:space-x-0">
                <Input
                  v-model="customStorageRoom"
                  type="text"
                  :placeholder="m.supply_item_modal_storage_room_custom_placeholder()"
                  class="w-full"
                  @keyup.enter="handleCustomStorageRoom"
                />
                <Button
                  type="button"
                  @click="handleCustomStorageRoom"
                  :disabled="!customStorageRoom.trim()"
                  size="icon"
                  variant="secondary"
                  title="Save custom storage room"
                  class="flex-shrink-0"
                >
                  <i class="i-mdi:check text-lg"></i>
                </Button>
                <Button
                  type="button"
                  @click="cancelCustomStorageRoom"
                  size="icon"
                  variant="outline"
                  title="Cancel custom storage room creation"
                  class="flex-shrink-0"
                >
                  <i class="i-mdi:close text-lg"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Shopping Hint -->
        <div class="grid gap-2">
          <Label for="shopping-hint">
            {{ m.supply_item_modal_shopping_hint_label() }}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              @click="showShoppingHintHelp = !showShoppingHintHelp"
              class="ml-1 h-4 w-4"
              :title="m.supply_item_modal_shopping_hint_help()"
            >
              <i class="i-mdi:help-circle-outline text-xs"></i>
            </Button>
          </Label>
          <div
            v-if="showShoppingHintHelp"
            class="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-2"
          >
            {{ m.supply_item_modal_shopping_hint_help() }}
          </div>
          <Textarea
            id="shopping-hint"
            v-model="form.shoppingHint"
            rows="2"
            :placeholder="m.supply_item_modal_shopping_hint_placeholder()"
          />
        </div>

        <!-- Preferred Brands -->
        <div class="grid gap-2">
          <Label>
            {{ m.supply_item_modal_preferred_brands_label() }}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              @click="showBrandsHelp = !showBrandsHelp"
              class="ml-1 h-4 w-4"
              :title="m.supply_item_modal_preferred_brands_help()"
            >
              <i class="i-mdi:help-circle-outline text-xs"></i>
            </Button>
          </Label>
          <div v-if="showBrandsHelp" class="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-2">
            {{ m.supply_item_modal_preferred_brands_help() }}
          </div>
          <div class="space-y-2">
            <!-- Existing brands -->
            <div
              v-if="form.preferredBrands && form.preferredBrands.length > 0"
              class="flex flex-wrap gap-2"
            >
              <Badge
                v-for="(brand, index) in form.preferredBrands"
                :key="index"
                variant="secondary"
                class="flex items-center gap-1"
              >
                <span>{{ brand }}</span>
                <Button
                  type="button"
                  @click="removeBrand(index)"
                  variant="ghost"
                  size="icon"
                  class="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <i class="i-mdi:close text-xs"></i>
                </Button>
              </Badge>
            </div>

            <!-- Add new brand -->
            <div class="flex space-x-2">
              <Input
                v-model="newBrand"
                type="text"
                :placeholder="m.supply_item_modal_preferred_brands_placeholder()"
                class="flex-1"
                @keyup.enter="addBrand"
              />
              <Button
                type="button"
                @click="addBrand"
                :disabled="!newBrand.trim()"
                size="icon"
                variant="outline"
              >
                <i class="i-mdi:plus text-lg"></i>
              </Button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <DialogFooter class="flex justify-end space-x-3 pt-6">
          <Button variant="outline" @click="emit('close')">
            {{ m.supply_item_modal_cancel() }}
          </Button>
          <Button type="submit">
            {{ isEditing ? m.supply_item_modal_update_item() : m.supply_item_modal_create_item() }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
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

const validationErrors = reactive({
  name: "",
  quantity: "",
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

const handleCategoryChange = (value: unknown) => {
  const stringValue = String(value || "")
  form.category = stringValue
  categorySelectMode.value = stringValue !== "custom"
  if (stringValue === "custom") {
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

const handleStorageChange = (value: unknown) => {
  const stringValue = String(value || "")
  form.storageRoom = stringValue
  storageSelectMode.value = stringValue !== "custom"
  if (stringValue === "custom") {
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
  // Clear previous validation errors
  validationErrors.name = ""
  validationErrors.quantity = ""

  // Validate required fields
  const trimmedName = form.name?.trim()
  if (!trimmedName) {
    validationErrors.name = m.supply_item_modal_validation_name_required()
    return
  }

  if (form.quantity < 0) {
    validationErrors.quantity = m.supply_item_modal_validation_quantity_negative()
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
