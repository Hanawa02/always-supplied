<template>
  <div
    class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
  >
    <div class="p-6">
      <!-- Building Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ building.name }}</h3>
          <p v-if="building.description" class="text-sm text-gray-600 mb-2">
            {{ building.description }}
          </p>
        </div>
        <div class="ml-4 flex space-x-1">
          <button
            @click="$emit('edit', building)"
            class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center w-8 h-8 cursor-pointer"
            title="Edit building"
          >
            <i class="i-mdi:pencil text-lg"></i>
          </button>
          <button
            @click="$emit('delete', building)"
            class="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors flex items-center justify-center w-8 h-8 cursor-pointer"
            title="Delete building"
          >
            <i class="i-mdi:delete text-lg"></i>
          </button>
        </div>
      </div>

      <!-- Building Details -->
      <div class="space-y-3">
        <!-- Supply Count -->
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">{{ suppliesCountLabel }}</span>
          <span class="text-lg font-bold text-primary-600">{{ supplyCount }}</span>
        </div>

        <!-- View Supplies Button -->
        <BaseButton variant="primary" full-width @click="$emit('viewSupplies', building)">
          <i class="i-mdi:package-variant text-lg mr-2"></i>{{ manageSuppliesLabel }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SuppliedBuilding } from "~/types/suppliedBuilding"

import BaseButton from "./BaseButton.vue"

interface Props {
  building: SuppliedBuilding
  supplyCount: number
  suppliesCountLabel: string
  manageSuppliesLabel: string
}

defineProps<Props>()

defineEmits<{
  viewSupplies: [building: SuppliedBuilding]
  edit: [building: SuppliedBuilding]
  delete: [building: SuppliedBuilding]
}>()
</script>
