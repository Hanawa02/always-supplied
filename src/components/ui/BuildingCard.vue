<template>
  <Card class="hover:shadow-md transition-shadow">
    <CardHeader class="pb-3">
      <!-- Building Header -->
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <CardTitle class="text-lg mb-1">{{ building.name }}</CardTitle>
          <CardDescription v-if="building.description" class="mb-2">
            {{ building.description }}
          </CardDescription>
        </div>
        <div class="ml-4 flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            @click="$emit('edit', building)"
            class="h-8 w-8 text-muted-foreground hover:text-primary"
            title="Edit building"
          >
            <i class="i-mdi:pencil text-lg"></i>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            @click="$emit('delete', building)"
            class="h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Delete building"
          >
            <i class="i-mdi:delete text-lg"></i>
          </Button>
        </div>
      </div>
    </CardHeader>

    <CardContent class="space-y-3">
      <!-- Supply Count -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-muted-foreground">{{ suppliesCountLabel }}</span>
        <span class="text-lg font-bold text-primary">{{ supplyCount }}</span>
      </div>

      <!-- View Supplies Button -->
      <BaseButton variant="primary" full-width @click="$emit('viewSupplies', building)">
        <i class="i-mdi:package-variant text-lg mr-2"></i>{{ manageSuppliesLabel }}
      </BaseButton>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
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
