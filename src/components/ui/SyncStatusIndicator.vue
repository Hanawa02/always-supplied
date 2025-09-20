<template>
  <div class="flex items-center space-x-2 text-sm">
    <!-- Connection Status -->
    <div class="flex items-center space-x-1">
      <div :class="['w-2 h-2 rounded-full', getConnectionStatusClass()]"></div>
      <span class="text-xs text-gray-600">
        {{ getConnectionStatusText() }}
      </span>
    </div>

    <!-- Sync Status -->
    <div v-if="showSyncStatus" class="flex items-center space-x-1">
      <i v-if="syncStatus.isSyncing" class="i-mdi:sync animate-spin text-blue-500"></i>
      <i
        v-else-if="syncStatus.pendingOperations > 0"
        class="i-mdi:cloud-upload text-orange-500"
      ></i>
      <i
        v-else-if="syncStatus.isOnline && isAuthenticated"
        class="i-mdi:cloud-check text-green-500"
      ></i>
      <i v-else-if="!syncStatus.isOnline" class="i-mdi:cloud-off text-gray-400"></i>

      <span class="text-xs text-gray-600">
        {{ getSyncStatusText() }}
      </span>
    </div>

    <!-- Error Indicator -->
    <Popover v-if="hasErrors" :open="showErrorPopover" @update:open="showErrorPopover = $event">
      <PopoverTrigger as-child>
        <button
          class="flex items-center space-x-1 text-red-500 hover:text-red-600"
          @click="showErrorPopover = !showErrorPopover"
        >
          <i class="i-mdi:alert-circle text-sm"></i>
          <span class="text-xs">{{ syncStatus.errors.length }}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent class="w-80">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="font-medium text-sm">Sync Errors</h4>
            <Button variant="ghost" size="sm" @click="clearErrors" class="text-xs"> Clear </Button>
          </div>
          <div class="space-y-1 max-h-32 overflow-y-auto">
            <div
              v-for="(error, index) in syncStatus.errors"
              :key="index"
              class="text-xs text-red-600 p-2 bg-red-50 rounded border"
            >
              {{ error }}
            </div>
          </div>
          <Button
            v-if="syncStatus.pendingOperations > 0"
            variant="outline"
            size="sm"
            @click="retryOperations"
            class="w-full text-xs"
          >
            Retry Failed Operations
          </Button>
        </div>
      </PopoverContent>
    </Popover>

    <!-- Pending Operations -->
    <div v-if="syncStatus.pendingOperations > 0" class="text-xs text-orange-600">
      {{ syncStatus.pendingOperations }} pending
    </div>

    <!-- Last Sync Time -->
    <div v-if="syncStatus.lastSync && !syncStatus.isSyncing" class="text-xs text-gray-500">
      {{ formatLastSync(syncStatus.lastSync) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

import { Button } from "~/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { use_auth } from "~/composables/use-auth"
import { useCloudSync } from "~/composables/useCloudSync"
import { realtimeSync } from "~/services/realtimeSync"

interface Props {
  showSyncStatus?: boolean
}

withDefaults(defineProps<Props>(), {
  showSyncStatus: true,
})

const { isAuthenticated } = use_auth()
const { syncStatus, retryFailedOperations, clearSyncErrors } = useCloudSync()

const showErrorPopover = ref(false)

const realtimeStatus = computed(() => realtimeSync.status)

const hasErrors = computed(() => syncStatus.value.errors.length > 0)

const getConnectionStatusClass = () => {
  if (!isAuthenticated.value) {
    return "bg-gray-400" // Not authenticated
  }

  if (!syncStatus.value.isOnline) {
    return "bg-red-400" // Offline
  }

  if (!realtimeStatus.value.isConnected || !realtimeStatus.value.isSubscribed) {
    return "bg-orange-400" // Connected but not subscribed
  }

  return "bg-green-400" // Fully connected
}

const getConnectionStatusText = () => {
  if (!isAuthenticated.value) {
    return "Offline"
  }

  if (!syncStatus.value.isOnline) {
    return "No connection"
  }

  if (!realtimeStatus.value.isConnected) {
    return "Connecting..."
  }

  if (!realtimeStatus.value.isSubscribed) {
    return "Syncing..."
  }

  return "Live"
}

const getSyncStatusText = () => {
  if (syncStatus.value.isSyncing) {
    return "Syncing..."
  }

  if (syncStatus.value.pendingOperations > 0) {
    return `${syncStatus.value.pendingOperations} pending`
  }

  if (!syncStatus.value.isOnline) {
    return "Offline"
  }

  if (!isAuthenticated.value) {
    return "Local only"
  }

  return "Synced"
}

const formatLastSync = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) {
    return "Just now"
  } else if (minutes < 60) {
    return `${minutes}m ago`
  } else {
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }
}

const clearErrors = () => {
  clearSyncErrors()
  realtimeSync.clearErrors()
  showErrorPopover.value = false
}

const retryOperations = async () => {
  await retryFailedOperations()
  showErrorPopover.value = false
}
</script>
