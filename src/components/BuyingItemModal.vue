<template>
  <Dialog :open="true" @update:open="(open) => !open && emit('close')">
    <DialogContent class="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {{ isEditing ? 'Edit Shopping Item' : 'Add Shopping Item' }}
        </DialogTitle>
      </DialogHeader>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
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
          <Label for="description">
            Description
          </Label>
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
          <Label for="shopping-hint">
            Shopping Hint
          </Label>
          <Textarea
            id="shopping-hint"
            v-model="form.shoppingHint"
            rows="2"
            placeholder="e.g., Check for discounts, buy organic"
          />
        </div>

        <!-- Notes -->
        <div class="grid gap-2">
          <Label for="notes">
            Notes
          </Label>
          <Textarea
            id="notes"
            v-model="form.notes"
            rows="2"
            placeholder="Additional notes for this shopping trip"
          />
        </div>

        <!-- Category (if not from supply item) -->
        <div v-if="!supplyItem" class="grid gap-2">
          <Label for="category">
            Category
          </Label>
          <Input
            id="category"
            v-model="form.category"
            type="text"
            placeholder="e.g., Cleaning, Food, Office"
          />
        </div>

        <!-- Actions -->
        <DialogFooter class="flex justify-end space-x-3 pt-6">
          <Button variant="outline" @click="emit('close')">
            Cancel
          </Button>
          <Button type="submit">
            {{ isEditing ? 'Update Item' : 'Add to List' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from "vue"

import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
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
})

const validationErrors = reactive({
  name: "",
  quantity: "",
})

// Computed
const isEditing = computed(() => !!props.item)

// Methods
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
    })
  }
})
</script>