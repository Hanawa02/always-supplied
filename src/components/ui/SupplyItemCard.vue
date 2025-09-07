<template>
  <div
    class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
  >
    <div class="p-6">
      <!-- Item Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ item.name }}</h3>
          <p v-if="item.description" class="text-sm text-gray-600 mb-2">
            {{ item.description }}
          </p>
        </div>
        <div class="ml-4 flex space-x-1">
          <button
            @click="$emit('edit', item)"
            class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center w-8 h-8 cursor-pointer"
            :title="editTooltip"
          >
            <i class="i-mdi:pencil text-lg"></i>
          </button>
          <button
            @click="$emit('delete', item)"
            class="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors flex items-center justify-center w-8 h-8 cursor-pointer"
            :title="deleteTooltip"
          >
            <i class="i-mdi:delete text-lg"></i>
          </button>
        </div>
      </div>

      <!-- Item Details -->
      <div class="space-y-3">
        <!-- Quantity -->
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">{{ quantityLabel }}:</span>
          <span class="text-lg font-bold text-primary-600">{{ item.quantity }}</span>
        </div>

        <!-- Category & Storage Room -->
        <div class="grid grid-cols-2 gap-4">
          <div v-if="item.category">
            <span class="text-xs text-gray-500">{{ categoryLabel }}</span>
            <div
              class="bg-primary-50 text-primary-700 px-2 py-1 rounded-full text-xs font-medium mt-1"
            >
              {{ item.category }}
            </div>
          </div>
          <div v-if="item.storageRoom">
            <span class="text-xs text-gray-500">{{ storageLabel }}</span>
            <div class="bg-info-50 text-info-700 px-2 py-1 rounded-full text-xs font-medium mt-1">
              {{ item.storageRoom }}
            </div>
          </div>
        </div>

        <!-- Shopping Hint -->
        <div v-if="item.shoppingHint" class="bg-warning-50 p-3 rounded-lg">
          <div class="flex items-start">
            <i
              class="i-mdi:lightbulb-outline text-warning-600 text-sm mt-0.5 mr-2 flex-shrink-0"
            ></i>
            <p class="text-xs text-warning-700">{{ item.shoppingHint }}</p>
          </div>
        </div>

        <!-- Preferred Brands -->
        <div v-if="item.preferredBrands && item.preferredBrands.length > 0">
          <span class="text-xs text-gray-500 mb-2 block">{{ preferredBrandsLabel }}</span>
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
</template>

<script setup lang="ts">
import type { SupplyItem } from "~/types/supply"

interface Props {
  item: SupplyItem
  editTooltip: string
  deleteTooltip: string
  quantityLabel: string
  categoryLabel: string
  storageLabel: string
  preferredBrandsLabel: string
}

defineProps<Props>()

defineEmits<{
  edit: [item: SupplyItem]
  delete: [item: SupplyItem]
}>()
</script>
