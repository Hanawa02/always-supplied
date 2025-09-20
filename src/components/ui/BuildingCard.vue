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
        <div class="ml-4 flex items-center space-x-1">
          <!-- Cloud Status Indicator -->
          <div v-if="is_authenticated" class="flex items-center mr-2">
            <i
              v-if="syncStatus?.isSyncing"
              class="i-mdi:sync animate-spin text-blue-500 w-4 h-4"
              title="Syncing to cloud"
            ></i>
            <i
              v-else-if="syncStatus?.pendingOperations > 0"
              class="i-mdi:cloud-upload text-orange-500 w-4 h-4"
              title="Pending sync operations"
            ></i>
            <i
              v-else-if="isOnline"
              class="i-mdi:cloud-check text-green-500 w-4 h-4"
              title="Synced to cloud"
            ></i>
            <i v-else class="i-mdi:cloud-off text-gray-400 w-4 h-4" title="Offline"></i>
          </div>

          <!-- Action Buttons -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 text-muted-foreground hover:text-primary"
              >
                <i class="i-mdi:dots-vertical text-lg"></i>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <PermissionGuard
                :building-id="building.id"
                permission="edit_building"
                :show-fallback="false"
              >
                <DropdownMenuItem @click="$emit('edit', building)">
                  <i class="i-mdi:pencil w-4 h-4 mr-2"></i>
                  Edit Building
                </DropdownMenuItem>
              </PermissionGuard>

              <DropdownMenuSeparator v-if="is_authenticated" />

              <PermissionGuard
                :building-id="building.id"
                permission="share_building"
                :show-fallback="false"
              >
                <DropdownMenuItem @click="$emit('share', building)">
                  <i class="i-mdi:share-variant w-4 h-4 mr-2"></i>
                  Share Building
                </DropdownMenuItem>
              </PermissionGuard>

              <PermissionGuard
                :building-id="building.id"
                permission="manage_members"
                :show-fallback="false"
              >
                <DropdownMenuItem @click="$emit('members', building)">
                  <i class="i-mdi:account-group w-4 h-4 mr-2"></i>
                  Manage Members
                </DropdownMenuItem>
              </PermissionGuard>

              <DropdownMenuSeparator />

              <PermissionGuard
                :building-id="building.id"
                permission="delete_building"
                :show-fallback="false"
              >
                <DropdownMenuItem @click="$emit('delete', building)" class="text-red-600">
                  <i class="i-mdi:delete w-4 h-4 mr-2"></i>
                  Delete Building
                </DropdownMenuItem>
              </PermissionGuard>
            </DropdownMenuContent>
          </DropdownMenu>
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
import { computed } from "vue"

import PermissionGuard from "~/components/permissions/PermissionGuard.vue"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { use_auth } from "~/composables/use-auth"
import { useCloudSync } from "~/composables/useCloudSync"
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
  share: [building: SuppliedBuilding]
  members: [building: SuppliedBuilding]
}>()

const { is_authenticated } = use_auth()
const { syncStatus } = useCloudSync()

const isOnline = computed(() => navigator.onLine)
</script>
