<template>
  <Card class="hover:shadow-md transition-shadow">
    <CardHeader class="pb-3">
      <!-- Item Header -->
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <CardTitle class="text-lg mb-1">{{ item.name }}</CardTitle>
          <CardDescription v-if="item.description" class="mb-2">
            {{ item.description }}
          </CardDescription>
        </div>
        <div class="ml-4 flex space-x-1">
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
    </CardHeader>

    <CardContent class="space-y-3">
      <!-- Quantity -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-muted-foreground">{{ quantityLabel }}:</span>
        <span class="text-lg font-bold text-primary">{{ item.quantity }}</span>
      </div>

      <!-- Category & Storage Room -->
      <div class="grid grid-cols-2 gap-4">
        <div v-if="item.category">
          <span class="text-xs text-muted-foreground">{{ categoryLabel }}</span>
          <Badge variant="secondary" class="mt-1 text-xs">
            {{ item.category }}
          </Badge>
        </div>
        <div v-if="item.storageRoom">
          <span class="text-xs text-muted-foreground">{{ storageLabel }}</span>
          <Badge variant="outline" class="mt-1 text-xs">
            {{ item.storageRoom }}
          </Badge>
        </div>
      </div>

      <!-- Shopping Hint -->
      <div v-if="item.shoppingHint" class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
        <div class="flex items-start">
          <i
            class="i-mdi:lightbulb-outline text-yellow-600 text-sm mt-0.5 mr-2 flex-shrink-0"
          ></i>
          <p class="text-xs text-yellow-700">{{ item.shoppingHint }}</p>
        </div>
      </div>

      <!-- Preferred Brands -->
      <div v-if="item.preferredBrands && item.preferredBrands.length > 0">
        <span class="text-xs text-muted-foreground mb-2 block">{{ preferredBrandsLabel }}</span>
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
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
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
