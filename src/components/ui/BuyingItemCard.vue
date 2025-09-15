<template>
  <Card :class="{ 'opacity-60': item.isBought }" class="hover:shadow-md transition-shadow">
    <CardContent class="flex flex-col p-4 space-y-2 h-full relative">
      <div class="absolute top-2 right-2">
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

      <!-- Header -->
      <div class="flex flex-col">
        <h3
          :class="{ 'line-through text-muted-foreground': item.isBought }"
          class="text-base font-medium mr-12"
        >
          {{ item.name }}
        </h3>
        <p v-if="item.description" class="text-sm text-muted-foreground mt-1">
          {{ item.description }}
        </p>
      </div>

      <!-- Item Details -->

      <!-- Quantity and Building -->
      <div class="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" class="text-xs">
          <i class="i-mdi:cart text-sm mr-2 text-green-600"></i>
          {{ quantityLabel }}: {{ item.quantity }}
        </Badge>
        <Badge v-if="buildingName" variant="outline" class="text-xs">
          <i class="i-mdi:domain text-sm mr-2 text-blue-600"></i>
          {{ buildingName }}
        </Badge>
        <Badge v-if="item.category" variant="outline" class="text-xs">
          {{ item.category }}
        </Badge>
      </div>

      <!-- Shopping Hint -->

      <p
        v-if="item.shoppingHint"
        class="text-xs text-yellow-700 flex items-start bg-yellow-50 p-2 rounded-md border border-yellow-200"
      >
        <i class="i-mdi:lightbulb-outline text-yellow-600 mr-1 mt-0.5 flex-shrink-0"></i>
        {{ item.shoppingHint }}
      </p>

      <!-- Notes -->

      <p
        v-if="item.notes"
        class="text-xs text-blue-700 flex items-start bg-blue-50 p-2 rounded-md border border-blue-200"
      >
        <i class="i-mdi:note-text-outline text-blue-600 mr-1 mt-0.5 flex-shrink-0"></i>
        {{ item.notes }}
      </p>

      <!-- Preferred Brands -->
      <div v-if="item.preferredBrands && item.preferredBrands.length > 0">
        <p class="text-xs text-muted-foreground">{{ preferredBrandsLabel }}</p>
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

      <Button
        @click="$emit('toggle', item)"
        :variant="item.isBought ? 'outline' : 'default'"
        size="sm"
        class="mt-auto w-full"
      >
        <i
          :class="item.isBought ? 'i-mdi:check-circle text-green-600' : 'i-mdi:cart'"
          class="text-sm mr-1"
        ></i>
        {{ item.isBought ? "Bought" : "Buy" }}
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import type { BuyingItem } from "~/types/buyingItem"

interface Props {
  item: BuyingItem
  editTooltip: string
  deleteTooltip: string
  quantityLabel: string
  preferredBrandsLabel: string
  buildingName?: string
}

defineProps<Props>()

defineEmits<{
  toggle: [item: BuyingItem]
  edit: [item: BuyingItem]
  delete: [item: BuyingItem]
}>()
</script>
