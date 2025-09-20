import { computed, onMounted, onUnmounted, ref, watch } from "vue"

import { use_auth } from "~/composables/use-auth"
import { offlineQueue, type QueueStatus } from "~/services/offlineQueue"

export interface OfflineStatus {
  isOnline: boolean
  isOffline: boolean
  lastOnlineTime?: Date
  reconnectAttempts: number
  pendingChanges: number
  isProcessingQueue: boolean
}

export function useOffline() {
  const { is_authenticated } = use_auth()

  // Connection state
  const isOnline = ref(navigator.onLine)
  const lastOnlineTime = ref<Date | null>(null)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5

  // Offline status
  const status = computed((): OfflineStatus => {
    const queueStatus: QueueStatus = offlineQueue.status

    return {
      isOnline: isOnline.value,
      isOffline: !isOnline.value,
      lastOnlineTime: lastOnlineTime.value || undefined,
      reconnectAttempts: reconnectAttempts.value,
      pendingChanges: queueStatus.pending,
      isProcessingQueue: queueStatus.processing,
    }
  })

  // Connection event handlers
  const handleOnline = async () => {
    const wasOffline = !isOnline.value
    isOnline.value = true
    reconnectAttempts.value = 0

    if (wasOffline) {
      console.log("Connection restored")

      // Auto-sync when coming back online
      if (is_authenticated.value) {
        await attemptSync()
      }
    }
  }

  const handleOffline = () => {
    isOnline.value = false
    lastOnlineTime.value = new Date()
    console.log("Connection lost - entering offline mode")
  }

  // Attempt to sync when connection is restored
  const attemptSync = async () => {
    try {
      if (!isOnline.value || !is_authenticated.value) return

      // Process pending offline queue
      await offlineQueue.processQueue()

      // Import and trigger cloud sync
      const { syncWithCloud } = await import("~/composables/useCloudSync")
      await syncWithCloud()

      console.log("Offline sync completed successfully")
    } catch (error) {
      console.error("Offline sync failed:", error)

      // Increment reconnect attempts
      reconnectAttempts.value++

      // Retry sync if we haven't exceeded max attempts
      if (reconnectAttempts.value < maxReconnectAttempts) {
        setTimeout(
          () => {
            attemptSync()
          },
          Math.pow(2, reconnectAttempts.value) * 1000,
        ) // Exponential backoff
      }
    }
  }

  // Manual retry function
  const retrySync = async () => {
    reconnectAttempts.value = 0
    await attemptSync()
  }

  // Get offline queue operations
  const getQueuedOperations = () => {
    return offlineQueue.getQueueOperations()
  }

  // Clear offline queue
  const clearQueue = () => {
    offlineQueue.clearQueue()
  }

  // Retry failed operations
  const retryFailedOperations = async () => {
    await offlineQueue.retryFailedOperations()
  }

  // Monitor connection status
  const startMonitoring = () => {
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Periodic connection check (every 30 seconds when offline)
    const connectionCheck = setInterval(() => {
      if (!isOnline.value && navigator.onLine) {
        handleOnline()
      } else if (isOnline.value && !navigator.onLine) {
        handleOffline()
      }
    }, 30000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(connectionCheck)
    }
  }

  // Set initial state
  onMounted(() => {
    isOnline.value = navigator.onLine
    if (!isOnline.value) {
      lastOnlineTime.value = new Date()
    }
  })

  // Start monitoring and cleanup on unmount
  const stopMonitoring = startMonitoring()
  onUnmounted(stopMonitoring)

  // Watch for authentication changes
  watch(is_authenticated, async (authenticated) => {
    if (authenticated && isOnline.value) {
      // Auto-sync when user authenticates and is online
      await attemptSync()
    }
  })

  return {
    // State
    status,
    isOnline: computed(() => isOnline.value),
    isOffline: computed(() => !isOnline.value),

    // Actions
    retrySync,
    retryFailedOperations,
    clearQueue,

    // Queue info
    getQueuedOperations,

    // Connection monitoring
    startMonitoring,

    // Computed helpers
    hasPendingChanges: computed(() => status.value.pendingChanges > 0),
    isProcessingQueue: computed(() => status.value.isProcessingQueue),
    needsAttention: computed(
      () =>
        status.value.isOffline ||
        status.value.pendingChanges > 0 ||
        status.value.reconnectAttempts > 0,
    ),
  }
}
