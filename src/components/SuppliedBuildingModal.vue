<template>
  <Dialog :open="true" @update:open="(open) => !open && emit('close')">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {{ isEditing ? m.building_modal_title_edit() : m.building_modal_title_add() }}
        </DialogTitle>
      </DialogHeader>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Name (Required) -->
        <div class="grid gap-2">
          <Label for="building-name">
            {{ m.building_modal_name_label() }}
            <span class="text-destructive">{{ m.building_modal_required_field() }}</span>
          </Label>
          <Input
            id="building-name"
            v-model="form.name"
            type="text"
            required
            :placeholder="m.building_modal_name_placeholder()"
            :class="validationErrors.name ? 'border-destructive' : ''"
          />
          <p v-if="validationErrors.name" class="text-sm text-destructive">
            {{ validationErrors.name }}
          </p>
        </div>

        <!-- Description -->
        <div class="grid gap-2">
          <Label for="building-description">
            {{ m.building_modal_description_label() }}
          </Label>
          <Textarea
            id="building-description"
            v-model="form.description"
            rows="3"
            :placeholder="m.building_modal_description_placeholder()"
          />
        </div>

        <!-- Actions -->
        <DialogFooter class="flex justify-end space-x-3 pt-6">
          <Button variant="outline" @click="emit('close')">
            {{ m.building_modal_cancel() }}
          </Button>
          <Button type="submit">
            {{
              isEditing ? m.building_modal_update_building() : m.building_modal_create_building()
            }}
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
import { useI18n } from "~/composables/useI18n"
import type {
  CreateSuppliedBuilding,
  SuppliedBuilding,
  UpdateSuppliedBuilding,
} from "~/types/suppliedBuilding"

interface Props {
  building?: SuppliedBuilding | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [building: CreateSuppliedBuilding | UpdateSuppliedBuilding]
}>()

const { m } = useI18n()

// Form state
const form = reactive<CreateSuppliedBuilding>({
  name: "",
  description: "",
})

const validationErrors = reactive({
  name: "",
})

// Computed
const isEditing = computed(() => !!props.building)

// Methods
const handleSubmit = () => {
  // Clear previous validation errors
  validationErrors.name = ""

  // Validate required fields
  const trimmedName = form.name?.trim()
  if (!trimmedName) {
    validationErrors.name = m.building_modal_validation_name_required()
    return
  }

  const buildingData = {
    name: trimmedName,
    description: form.description?.trim() || undefined,
  }

  if (isEditing.value && props.building) {
    // Include ID for updates
    const updateData: UpdateSuppliedBuilding = {
      id: props.building.id,
      ...buildingData,
    }
    emit("save", updateData)
  } else {
    emit("save", buildingData)
  }
}

// Initialize form with existing building data
onMounted(() => {
  if (props.building) {
    Object.assign(form, {
      name: props.building.name,
      description: props.building.description || "",
    })
  }
})
</script>
