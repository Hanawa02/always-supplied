import { computed, onUnmounted, ref, watch } from 'vue'

import { toast } from '~/components/ui/toast'
import { useAuth } from '~/composables/useAuth'
import { type ChangeEvent,realtimeSync } from '~/services/realtimeSync'

export function useRealtime() {
  const { isAuthenticated } = useAuth()
  const recentChanges = ref<ChangeEvent[]>([])
  const maxRecentChanges = 50

  // Status computed from realtime service
  const status = computed(() => realtimeSync.status)

  // Add change listener
  const unsubscribe = realtimeSync.addChangeListener((event: ChangeEvent) => {
    // Add to recent changes
    recentChanges.value.unshift(event)
    if (recentChanges.value.length > maxRecentChanges) {
      recentChanges.value = recentChanges.value.slice(0, maxRecentChanges)
    }

    // Show toast notification for changes from other sources
    showChangeNotification(event)
  })

  // Show notification for realtime changes
  const showChangeNotification = (event: ChangeEvent) => {
    let title = ''
    let description = ''

    switch (event.type) {
      case 'building':
        title = event.action === 'INSERT' ? 'Building Added' :
                event.action === 'UPDATE' ? 'Building Updated' : 'Building Deleted'
        description = `${event.data.name} was ${event.action.toLowerCase()}d by another user`
        break

      case 'supply_item':
        title = event.action === 'INSERT' ? 'Item Added' :
                event.action === 'UPDATE' ? 'Item Updated' : 'Item Removed'
        description = `${event.data.name} was ${event.action.toLowerCase()}d in supply inventory`
        break

      case 'buying_item':
        title = event.action === 'INSERT' ? 'Item Added' :
                event.action === 'UPDATE' ? 'Item Updated' : 'Item Removed'
        description = `${event.data.name} was ${event.action.toLowerCase()}d in shopping list`
        break
    }

    // Only show notifications for changes from other users
    // (our own changes are already reflected in the UI)
    if (title && description) {
      toast({
        title,
        description,
        duration: 3000,
      })
    }
  }

  // Clear recent changes
  const clearRecentChanges = () => {
    recentChanges.value = []
  }

  // Get changes by type
  const getChangesByType = (type: 'building' | 'supply_item' | 'buying_item') => {
    return computed(() => recentChanges.value.filter(change => change.type === type))
  }

  // Get recent changes for a specific building
  const getBuildingChanges = (buildingId: string) => {
    return computed(() =>
      recentChanges.value.filter(change =>
        (change.type === 'building' && change.data.local_id === buildingId) ||
        (change.type === 'supply_item' && change.data.building_id === buildingId) ||
        (change.type === 'buying_item' && change.data.building_id === buildingId)
      )
    )
  }

  // Clear errors
  const clearErrors = () => {
    realtimeSync.clearErrors()
  }

  // Get diagnostics
  const getDiagnostics = () => {
    return realtimeSync.getDiagnostics()
  }

  // Connection state helpers
  const isConnected = computed(() => status.value.isConnected)
  const isSubscribed = computed(() => status.value.isSubscribed)
  const hasErrors = computed(() => status.value.errors.length > 0)

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribe()
  })

  return {
    // State
    status,
    recentChanges: computed(() => recentChanges.value),

    // Connection state
    isConnected,
    isSubscribed,
    hasErrors,

    // Actions
    clearRecentChanges,
    clearErrors,
    getDiagnostics,

    // Filtered changes
    getChangesByType,
    getBuildingChanges,

    // Computed helpers
    buildingChanges: getChangesByType('building'),
    supplyItemChanges: getChangesByType('supply_item'),
    buyingItemChanges: getChangesByType('buying_item')
  }
}