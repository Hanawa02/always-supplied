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
            {{ isEditing ? m.building_modal.title_edit() : m.building_modal.title_add() }}
          </h3>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
            :title="m.building_modal.close_tooltip()"
          >
            <i class="i-mdi:close text-xl"></i>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name (Required) -->
          <div>
            <label for="building-name" class="block text-sm font-medium text-gray-700 mb-2">
              {{ m.building_modal.name_label() }}
              <span class="text-danger-500">{{ m.building_modal.required_field() }}</span>
            </label>
            <input
              id="building-name"
              v-model="form.name"
              type="text"
              required
              :placeholder="m.building_modal.name_placeholder()"
              class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <!-- Description -->
          <div>
            <label for="building-description" class="block text-sm font-medium text-gray-700 mb-2">
              {{ m.building_modal.description_label() }}
            </label>
            <textarea
              id="building-description"
              v-model="form.description"
              rows="3"
              :placeholder="m.building_modal.description_placeholder()"
              class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <BaseButton variant="secondary" @click="emit('close')">
              {{ m.building_modal.cancel() }}
            </BaseButton>
            <BaseButton variant="primary" type="submit">
              {{
                isEditing ? m.building_modal.update_building() : m.building_modal.create_building()
              }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from "vue"

import BaseButton from "~/components/ui/BaseButton.vue"
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

// Computed
const isEditing = computed(() => !!props.building)

// Methods
const handleSubmit = () => {
  // Validate required fields
  const trimmedName = form.name?.trim()
  if (!trimmedName) {
    alert(m.building_modal.validation.name_required())
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
