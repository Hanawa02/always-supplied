<template>
  <div
    v-if="shouldShow"
    :class="[
      'fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm',
      'bg-white border border-gray-200 rounded-lg shadow-lg',
      'transition-all duration-300 ease-in-out',
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    ]"
  >
    <div class="p-4">
      <!-- Offline Status -->
      <div v-if="offlineStatus.isOffline" class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <i class="i-mdi:wifi-off w-5 h-5 text-orange-500 mt-0.5"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-medium text-gray-900">
            {{ m.offline_no_connection() }}
          </h4>
          <p class="text-xs text-gray-500 mt-1">
            {{ m.offline_changes_queued() }}
          </p>
          <div v-if="offlineStatus.pendingChanges > 0" class="text-xs text-orange-600 mt-1">
            {{ m.offline_pending_changes({ count: offlineStatus.pendingChanges }) }}
          </div>
        </div>
      </div>

      <!-- Syncing Status -->
      <div v-else-if="offlineStatus.isProcessingQueue" class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <i class="i-mdi:sync animate-spin w-5 h-5 text-blue-500 mt-0.5"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-medium text-gray-900">
            {{ m.offline_syncing() }}
          </h4>
          <p class="text-xs text-gray-500 mt-1">
            {{ m.offline_syncing_changes() }}
          </p>
        </div>
      </div>

      <!-- Reconnect Status -->
      <div v-else-if="offlineStatus.reconnectAttempts > 0" class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <i class="i-mdi:wifi-strength-2 w-5 h-5 text-yellow-500 mt-0.5"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-medium text-gray-900">
            {{ m.offline_reconnecting() }}
          </h4>
          <p class="text-xs text-gray-500 mt-1">
            {{ m.offline_retry_attempt({ attempt: offlineStatus.reconnectAttempts }) }}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          @click="retryConnection"
          class="text-xs"
        >
          {{ m.offline_retry() }}
        </Button>
      </div>

      <!-- Actions -->
      <div v-if="showActions" class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div class="flex space-x-2">
          <Button
            v-if="offlineStatus.pendingChanges > 0"
            variant="outline"
            size="sm"
            @click="viewPendingChanges"
            class="text-xs"
          >
            {{ m.offline_view_changes() }}
          </Button>
          <Button
            v-if="offlineStatus.isOnline && offlineStatus.pendingChanges > 0"
            variant="outline"
            size="sm"
            @click="syncNow"
            :disabled="isSyncing"
            class="text-xs"
          >
            <i v-if="isSyncing" class="i-mdi:loading animate-spin w-3 h-3 mr-1"></i>
            {{ m.offline_sync_now() }}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          @click="dismiss"
          class="text-xs"
        >
          {{ m.common_dismiss() }}
        </Button>
      </div>
    </div>
  </div>

  <!-- Pending Changes Modal -->
  <Dialog :open="showChangesModal" @update:open="showChangesModal = $event">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ m.offline_pending_changes_title() }}</DialogTitle>
        <DialogDescription>
          {{ m.offline_pending_changes_description() }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-3 max-h-64 overflow-y-auto">
        <div
          v-for="operation in queuedOperations"
          :key="operation.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
        >
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">
              {{ formatOperationType(operation.type, operation.entity) }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatOperationTime(operation.timestamp) }}
            </p>
            <p v-if="operation.error" class="text-xs text-red-600 mt-1">
              {{ operation.error }}
            </p>
          </div>
          <div class="flex items-center">
            <i
              v-if="operation.error"
              class="i-mdi:alert-circle w-4 h-4 text-red-500"
              title="Failed operation"
            ></i>
            <i
              v-else
              class="i-mdi:clock w-4 h-4 text-gray-400"
              title="Pending operation"
            ></i>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          @click="showChangesModal = false"
        >
          {{ m.common_close() }}
        </Button>
        <Button
          v-if="hasFailedOperations"
          @click="retryFailed"
          :disabled="isSyncing"
        >
          <i v-if="isSyncing" class="i-mdi:loading animate-spin w-4 h-4 mr-2"></i>
          {{ m.offline_retry_failed() }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { toast } from '~/components/ui/toast'
import { useI18n } from '~/composables/useI18n'
import { useOffline } from '~/composables/useOffline'
// import type { QueuedOperation } from '~/services/offlineQueue'

interface Props {
  autoHide?: boolean
  showActions?: boolean
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoHide: true,
  showActions: true,
  persistent: false
})

const { m } = useI18n()
const {
  status: offlineStatus,
  retrySync,
  retryFailedOperations,
  getQueuedOperations
} = useOffline()

// UI state
const isVisible = ref(false)
const isDismissed = ref(false)
const isSyncing = ref(false)
const showChangesModal = ref(false)

// Computed
const shouldShow = computed(() => {
  if (isDismissed.value && !props.persistent) return false

  return (
    offlineStatus.value.isOffline ||
    offlineStatus.value.pendingChanges > 0 ||
    offlineStatus.value.isProcessingQueue ||
    offlineStatus.value.reconnectAttempts > 0
  )
})

const queuedOperations = computed(() => getQueuedOperations())

const hasFailedOperations = computed(() => {
  return queuedOperations.value.some(op => op.error)
})

// Show/hide logic
watch(shouldShow, (show) => {
  if (show) {
    isDismissed.value = false
    isVisible.value = true
  } else if (props.autoHide) {
    setTimeout(() => {
      isVisible.value = false
    }, 3000) // Hide after 3 seconds when status becomes normal
  }
})

// Auto-dismiss after 10 seconds if offline
watch(() => offlineStatus.value.isOffline, (isOffline) => {
  if (isOffline && props.autoHide && !props.persistent) {
    setTimeout(() => {
      if (offlineStatus.value.isOffline) {
        isVisible.value = false
      }
    }, 10000)
  }
})

// Actions
const retryConnection = async () => {
  isSyncing.value = true
  try {
    await retrySync()
    toast({
      title: 'Sync Retry',
      description: 'Attempting to sync pending changes...',
    })
  } catch {
    toast({
      title: 'Sync Failed',
      description: 'Unable to sync changes. Will retry automatically.',
      variant: 'destructive',
    })
  } finally {
    isSyncing.value = false
  }
}

const syncNow = async () => {
  isSyncing.value = true
  try {
    // Import sync function
    const { useCloudSync } = await import('~/composables/useCloudSync')
    const { syncWithCloud } = useCloudSync()
    await syncWithCloud()

    toast({
      title: 'Sync Complete',
      description: 'All changes have been synchronized.',
    })
  } catch {
    toast({
      title: 'Sync Failed',
      description: 'Unable to sync changes at this time.',
      variant: 'destructive',
    })
  } finally {
    isSyncing.value = false
  }
}

const viewPendingChanges = () => {
  showChangesModal.value = true
}

const retryFailed = async () => {
  isSyncing.value = true
  try {
    await retryFailedOperations()
    toast({
      title: 'Retrying Failed Operations',
      description: 'Attempting to sync failed changes...',
    })
  } catch {
    toast({
      title: 'Retry Failed',
      description: 'Unable to retry failed operations.',
      variant: 'destructive',
    })
  } finally {
    isSyncing.value = false
  }
}

const dismiss = () => {
  isDismissed.value = true
  isVisible.value = false
}

// Format operation for display
const formatOperationType = (type: string, entity: string) => {
  const actionMap = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted'
  }

  const entityMap = {
    building: 'Building',
    supply_item: 'Supply Item',
    buying_item: 'Shopping Item'
  }

  return `${actionMap[type as keyof typeof actionMap] || type} ${entityMap[entity as keyof typeof entityMap] || entity}`
}

const formatOperationTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

  if (diffMinutes < 1) {
    return 'Just now'
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  } else {
    const diffHours = Math.floor(diffMinutes / 60)
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }
}
</script>