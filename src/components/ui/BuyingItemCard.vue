<template>
  <Card :class="{ 'opacity-60': item.isBought }" class="hover:shadow-md transition-shadow">
    <CardContent class="p-4">
      <!-- Header with checkbox and name -->
      <div class="flex items-start gap-3">
        <Checkbox
          :id="`buying-item-${item.id}`"
          :checked="item.isBought"
          @update:checked="$emit('toggle', item)"
          class="mt-1"
        />
        <div class="flex-1">
          <label
            :for="`buying-item-${item.id}`"
            :class="{ 'line-through text-muted-foreground': item.isBought }"
            class="text-base font-medium cursor-pointer"
          >
            {{ item.name }}
          </label>
          <p v-if="item.description" class="text-sm text-muted-foreground mt-1">
            {{ item.description }}
          </p>
        </div>
        <div class="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            @click="$emit('edit', item)"
            class="h-8 w-8 text-muted-foreground hover:text-primary"
            :title="editTooltip"
          >
            <i class="i-mdi:pencil text-lg"></i>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            @click="$emit('delete', item)"
            class="h-8 w-8 text-muted-foreground hover:text-destructive"
            :title="deleteTooltip"
          >
            <i class="i-mdi:delete text-lg"></i>
          </Button>
        </div>
      </div>

      <!-- Item Details -->
      <div class="ml-7 mt-3 space-y-2">
        <!-- Quantity -->
        <div class="flex items-center gap-2">
          <Badge variant="secondary" class="text-xs">
            <i class="i-mdi:cart text-sm mr-1"></i>
            {{ quantityLabel }}: {{ item.quantity }}
          </Badge>
          <Badge v-if="item.category" variant="outline" class="text-xs">
            {{ item.category }}
          </Badge>
        </div>

        <!-- Shopping Hint -->
        <div v-if="item.shoppingHint" class="bg-yellow-50 p-2 rounded-md border border-yellow-200">
          <p class="text-xs text-yellow-700 flex items-start">
            <i class="i-mdi:lightbulb-outline text-yellow-600 mr-1 mt-0.5 flex-shrink-0"></i>
            {{ item.shoppingHint }}
          </p>
        </div>

        <!-- Notes -->
        <div v-if="item.notes" class="bg-blue-50 p-2 rounded-md border border-blue-200">
          <p class="text-xs text-blue-700 flex items-start">
            <i class="i-mdi:note-text-outline text-blue-600 mr-1 mt-0.5 flex-shrink-0"></i>
            {{ item.notes }}
          </p>
        </div>

        <!-- Preferred Brands -->
        <div v-if="item.preferredBrands && item.preferredBrands.length > 0">
          <p class="text-xs text-muted-foreground mb-1">{{ preferredBrandsLabel }}</p>
          <div class="flex flex-wrap gap-1">
            <Badge
              v-for="brand in item.preferredBrands"
              :key="brand"
              variant="outline"
              class="text-xs"
            >
              {{ brand }}
            </Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import type { BuyingItem } from "~/types/buyingItem"

interface Props {
  item: BuyingItem
  editTooltip: string
  deleteTooltip: string
  quantityLabel: string
  preferredBrandsLabel: string
}

defineProps<Props>()

defineEmits<{
  toggle: [item: BuyingItem]
  edit: [item: BuyingItem]
  delete: [item: BuyingItem]
}>()
</script>