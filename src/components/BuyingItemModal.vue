<template>
  <Dialog :open="true" @update:open="handleDialogClose">
    <DialogContent class="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {{ isEditing ? "Edit Shopping Item" : "Add Shopping Item" }}
        </DialogTitle>
      </DialogHeader>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" @keydown.enter="handleFormEnter" class="space-y-6">
        <!-- Name (Required) -->
        <div class="grid gap-2">
          <Label for="name">
            Name
            <span class="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            v-model="form.name"
            type="text"
            required
            placeholder="Enter item name"
            :class="validationErrors.name ? 'border-destructive' : ''"
          />
          <p v-if="validationErrors.name" class="text-sm text-destructive">
            {{ validationErrors.name }}
          </p>
        </div>

        <!-- Description -->
        <div class="grid gap-2">
          <Label for="description"> Description </Label>
          <Textarea
            id="description"
            v-model="form.description"
            rows="2"
            placeholder="Add a description (optional)"
          />
        </div>

        <!-- Quantity (Required) -->
        <div class="grid gap-2">
          <Label for="quantity">
            Quantity to Buy
            <span class="text-destructive">*</span>
          </Label>
          <Input
            id="quantity"
            v-model.number="form.quantity"
            type="number"
            min="1"
            required
            placeholder="How many do you need?"
            :class="validationErrors.quantity ? 'border-destructive' : ''"
          />
          <p v-if="validationErrors.quantity" class="text-sm text-destructive">
            {{ validationErrors.quantity }}
          </p>
        </div>

        <!-- Shopping Hint -->
        <div class="grid gap-2">
          <Label for="shopping-hint"> Shopping Hint </Label>
          <Textarea
            id="shopping-hint"
            v-model="form.shoppingHint"
            rows="2"
            placeholder="e.g., Check for discounts, buy organic"
          />
        </div>

        <!-- Notes -->
        <div class="grid gap-2">
          <Label for="notes"> Notes </Label>
          <Textarea
            id="notes"
            v-model="form.notes"
            rows="2"
            placeholder="Additional notes for this shopping trip"
          />
        </div>

        <!-- Preferred Brands -->
        <div class="grid gap-2">
          <Label for="preferred-brands"> Preferred Brands </Label>
          <div class="space-y-3">
            <!-- Add brand input -->
            <div class="flex space-x-2">
              <Input
                v-model="newBrand"
                type="text"
                placeholder="Add a brand..."
                class="flex-1"
                @keyup.enter="addBrand"
              />
              <Button
                type="button"
                @click="addBrand"
                :disabled="!newBrand.trim()"
                size="icon"
                variant="secondary"
                title="Add brand"
              >
                <i class="i-mdi:plus text-lg"></i>
              </Button>
            </div>

            <!-- Current brands -->
            <div
              v-if="form.preferredBrands && form.preferredBrands.length > 0"
              class="flex flex-wrap gap-2"
            >
              <Badge
                v-for="(brand, index) in form.preferredBrands"
                :key="brand"
                variant="secondary"
                class="flex items-center gap-1 px-2 py-1"
              >
                {{ brand }}
                <Button
                  type="button"
                  @click="removeBrand(index)"
                  size="icon"
                  variant="ghost"
                  class="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  title="Remove brand"
                >
                  <i class="i-mdi:close text-xs"></i>
                </Button>
              </Badge>
            </div>
          </div>
        </div>

        <!-- Category (if not from supply item) -->
        <div v-if="!supplyItem" class="grid gap-2">
          <Label for="category"> Category </Label>
          <Input
            id="category"
            v-model="form.category"
            type="text"
            placeholder="e.g., Cleaning, Food, Office"
          />
        </div>

        <!-- Actions -->
        <DialogFooter class="flex justify-end space-3 pt-6 gap-3">
          <Button variant="outline" @click="emit('close')"> Cancel </Button>
          <Button type="submit">
            {{ isEditing ? "Update Item" : "Add to List" }}
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
import { Textarea } from "~/components/ui/textarea"
import type { BuyingItem, CreateBuyingItem, UpdateBuyingItem } from "~/types/buyingItem"
import type { SupplyItem } from "~/types/supply"

interface Props {
  item?: BuyingItem | null
  supplyItem?: SupplyItem | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [item: CreateBuyingItem | UpdateBuyingItem]
}>()

// Form state
const form = reactive<CreateBuyingItem>({
  name: "",
  description: "",
  quantity: 1,
  shoppingHint: "",
  notes: "",
  category: "",
  preferredBrands: [],
})

const newBrand = ref("")

const validationErrors = reactive({
  name: "",
  quantity: "",
})

// Computed
const isEditing = computed(() => !!props.item)

// Methods
const handleDialogClose = (open: boolean) => {
  // Only close if the dialog is being closed, not opened
  if (!open) {
    emit("close")
  }
}

const handleFormEnter = (event: KeyboardEvent) => {
  // Prevent Enter from bubbling up to the Dialog
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    // Only submit if not in a textarea (to allow line breaks)
    if (!(event.target instanceof HTMLTextAreaElement)) {
      event.preventDefault()
      handleSubmit()
    }
  }
}

const addBrand = () => {
  const brand = newBrand.value.trim()
  if (!brand) return

  if (!form.preferredBrands) form.preferredBrands = []
  if (!form.preferredBrands.includes(brand)) {
    form.preferredBrands.push(brand)
  }
  newBrand.value = ""
}

const removeBrand = (index: number) => {
  if (form.preferredBrands) {
    form.preferredBrands.splice(index, 1)
  }
}

const handleSubmit = () => {
  // Clear previous validation errors
  validationErrors.name = ""
  validationErrors.quantity = ""

  // Validate required fields
  const trimmedName = form.name?.trim()
  if (!trimmedName) {
    validationErrors.name = "Name is required"
    return
  }

  if (form.quantity < 1) {
    validationErrors.quantity = "Quantity must be at least 1"
    return
  }

  const itemData = {
    ...form,
    name: trimmedName,
    description: form.description?.trim() || undefined,
    shoppingHint: form.shoppingHint?.trim() || undefined,
    notes: form.notes?.trim() || undefined,
    category: form.category?.trim() || undefined,
    preferredBrands: form.preferredBrands?.filter((brand) => brand.trim()) || undefined,
  }

  if (isEditing.value && props.item) {
    // Include ID for updates
    const updateData: UpdateBuyingItem = {
      id: props.item.id,
      ...itemData,
    }
    emit("save", updateData)
  } else {
    // Add supply item reference if creating from supply item
    if (props.supplyItem) {
      itemData.supplyItemId = props.supplyItem.id
      itemData.buildingId = props.supplyItem.buildingId
    }
    emit("save", itemData)
  }
}

// Initialize form with existing item or supply item data
onMounted(() => {
  if (props.item) {
    // Editing existing buying item
    Object.assign(form, {
      name: props.item.name,
      description: props.item.description || "",
      quantity: props.item.quantity,
      shoppingHint: props.item.shoppingHint || "",
      notes: props.item.notes || "",
      category: props.item.category || "",
      preferredBrands: props.item.preferredBrands ? [...props.item.preferredBrands] : [],
    })
  } else if (props.supplyItem) {
    // Creating from supply item
    Object.assign(form, {
      name: props.supplyItem.name,
      description: props.supplyItem.description || "",
      quantity: props.supplyItem.quantity,
      shoppingHint: props.supplyItem.shoppingHint || "",
      category: props.supplyItem.category || "",
      notes: "",
      preferredBrands: props.supplyItem.preferredBrands
        ? [...props.supplyItem.preferredBrands]
        : [],
    })
  }
})
</script>
