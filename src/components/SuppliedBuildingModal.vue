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
            {{ isEditing ? 'Edit Building' : 'Add Building' }}
          </h3>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
            title="Close modal"
          >
            <i class="i-mdi:close text-xl"></i>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name (Required) -->
          <div>
            <label for="building-name" class="block text-sm font-medium text-gray-700 mb-2">
              Building Name
              <span class="text-danger-500">*</span>
            </label>
            <input
              id="building-name"
              v-model="form.name"
              type="text"
              required
              placeholder="e.g., Main Office, Home Kitchen"
              class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <!-- Description -->
          <div>
            <label for="building-description" class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="building-description"
              v-model="form.description"
              rows="3"
              placeholder="Brief description of the building..."
              class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          <!-- Address -->
          <div>
            <label for="building-address" class="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              id="building-address"
              v-model="form.address"
              rows="2"
              placeholder="Full address of the building..."
              class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors cursor-pointer"
            >
              {{ isEditing ? 'Update Building' : 'Create Building' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from "vue"
import type { CreateSuppliedBuilding, SuppliedBuilding, UpdateSuppliedBuilding } from "~/types/suppliedBuilding"

interface Props {
  building?: SuppliedBuilding | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [building: CreateSuppliedBuilding | UpdateSuppliedBuilding]
}>()

// Form state
const form = reactive<CreateSuppliedBuilding>({
  name: "",
  description: "",
  address: "",
})

// Computed
const isEditing = computed(() => !!props.building)

// Methods
const handleSubmit = () => {
  // Validate required fields
  const trimmedName = form.name?.trim()
  if (!trimmedName) {
    alert('Building name is required and cannot be empty.')
    return
  }

  const buildingData = {
    ...form,
    name: trimmedName, // Use trimmed name
    // Clean up empty strings
    description: form.description?.trim() || undefined,
    address: form.address?.trim() || undefined,
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
      address: props.building.address || "",
    })
  }
})
</script>