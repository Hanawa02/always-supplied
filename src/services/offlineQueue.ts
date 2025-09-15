import { ref, computed } from 'vue'

export interface QueuedOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: 'building' | 'supply_item' | 'buying_item'
  entityId: string
  buildingId?: string
  data?: any
  timestamp: number
  retryCount: number
  maxRetries: number
  error?: string
}

export interface QueueStatus {
  pending: number
  processing: boolean
  lastSync?: Date
  errors: string[]
}

const STORAGE_KEY = 'always_supplied_offline_queue'
const MAX_RETRIES = 3
const RETRY_DELAY_BASE = 1000 // 1 second base delay

class OfflineQueueService {
  private queue = ref<QueuedOperation[]>([])
  private processing = ref(false)
  private lastSync = ref<Date | null>(null)
  private errors = ref<string[]>([])

  constructor() {
    this.loadQueue()

    // Auto-process queue when online
    window.addEventListener('online', () => {
      this.processQueue()
    })
  }

  get status(): QueueStatus {
    return {
      pending: this.queue.value.length,
      processing: this.processing.value,
      lastSync: this.lastSync.value || undefined,
      errors: this.errors.value
    }
  }

  get isEmpty() {
    return computed(() => this.queue.value.length === 0)
  }

  get isOnline() {
    return navigator.onLine
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.queue.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error)
      this.queue.value = []
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue.value))
    } catch (error) {
      console.error('Failed to save offline queue:', error)
    }
  }

  private generateId(): string {
    return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Add operations to queue
  addBuildingOperation(
    type: 'create' | 'update' | 'delete',
    buildingId: string,
    data?: any
  ) {
    const operation: QueuedOperation = {
      id: this.generateId(),
      type,
      entity: 'building',
      entityId: buildingId,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: MAX_RETRIES
    }

    this.queue.value.push(operation)
    this.saveQueue()

    // Try to process immediately if online
    if (this.isOnline) {
      this.processQueue()
    }
  }

  addSupplyItemOperation(
    type: 'create' | 'update' | 'delete',
    itemId: string,
    buildingId: string,
    data?: any
  ) {
    const operation: QueuedOperation = {
      id: this.generateId(),
      type,
      entity: 'supply_item',
      entityId: itemId,
      buildingId,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: MAX_RETRIES
    }

    this.queue.value.push(operation)
    this.saveQueue()

    if (this.isOnline) {
      this.processQueue()
    }
  }

  addBuyingItemOperation(
    type: 'create' | 'update' | 'delete',
    itemId: string,
    buildingId: string,
    data?: any
  ) {
    const operation: QueuedOperation = {
      id: this.generateId(),
      type,
      entity: 'buying_item',
      entityId: itemId,
      buildingId,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: MAX_RETRIES
    }

    this.queue.value.push(operation)
    this.saveQueue()

    if (this.isOnline) {
      this.processQueue()
    }
  }

  // Process queue
  async processQueue(): Promise<void> {
    if (this.processing.value || !this.isOnline || this.queue.value.length === 0) {
      return
    }

    this.processing.value = true
    this.errors.value = []

    try {
      // Import here to avoid circular dependencies
      const { cloudStorage } = await import('~/services/cloudStorage')

      const queueCopy = [...this.queue.value]
      const processed: string[] = []

      for (const operation of queueCopy) {
        try {
          let success = false

          switch (operation.entity) {
            case 'building':
              success = await this.processBuildingOperation(operation, cloudStorage)
              break
            case 'supply_item':
              success = await this.processSupplyItemOperation(operation, cloudStorage)
              break
            case 'buying_item':
              success = await this.processBuyingItemOperation(operation, cloudStorage)
              break
          }

          if (success) {
            processed.push(operation.id)
          } else {
            // Increment retry count
            operation.retryCount++
            if (operation.retryCount >= operation.maxRetries) {
              // Remove failed operation after max retries
              processed.push(operation.id)
              this.errors.value.push(
                `Failed to sync ${operation.entity} ${operation.entityId} after ${operation.maxRetries} attempts`
              )
            }
          }
        } catch (error) {
          operation.retryCount++
          operation.error = (error as Error).message

          if (operation.retryCount >= operation.maxRetries) {
            processed.push(operation.id)
            this.errors.value.push(
              `Failed to sync ${operation.entity} ${operation.entityId}: ${operation.error}`
            )
          }
        }

        // Add delay between operations to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Remove processed operations
      this.queue.value = this.queue.value.filter(op => !processed.includes(op.id))
      this.saveQueue()

      if (processed.length > 0) {
        this.lastSync.value = new Date()
      }
    } catch (error) {
      this.errors.value.push(`Queue processing failed: ${(error as Error).message}`)
    } finally {
      this.processing.value = false
    }
  }

  private async processBuildingOperation(
    operation: QueuedOperation,
    cloudStorage: any
  ): Promise<boolean> {
    switch (operation.type) {
      case 'create':
      case 'update':
        if (!operation.data) return false
        const result = await cloudStorage.syncBuilding(operation.data)
        return result.success

      case 'delete':
        const deleteResult = await cloudStorage.deleteBuilding(operation.entityId)
        return deleteResult.success

      default:
        return false
    }
  }

  private async processSupplyItemOperation(
    operation: QueuedOperation,
    cloudStorage: any
  ): Promise<boolean> {
    if (!operation.buildingId) return false

    switch (operation.type) {
      case 'create':
      case 'update':
        if (!operation.data) return false
        const result = await cloudStorage.syncSupplyItem(operation.data, operation.buildingId)
        return result.success

      case 'delete':
        const deleteResult = await cloudStorage.deleteSupplyItem(operation.entityId, operation.buildingId)
        return deleteResult.success

      default:
        return false
    }
  }

  private async processBuyingItemOperation(
    operation: QueuedOperation,
    cloudStorage: any
  ): Promise<boolean> {
    if (!operation.buildingId) return false

    switch (operation.type) {
      case 'create':
      case 'update':
        if (!operation.data) return false
        const result = await cloudStorage.syncBuyingItem(operation.data, operation.buildingId)
        return result.success

      case 'delete':
        const deleteResult = await cloudStorage.deleteBuyingItem(operation.entityId, operation.buildingId)
        return deleteResult.success

      default:
        return false
    }
  }

  // Retry failed operations
  async retryFailedOperations(): Promise<void> {
    const failedOps = this.queue.value.filter(op => op.error)
    for (const op of failedOps) {
      op.retryCount = 0
      op.error = undefined
    }
    this.saveQueue()

    if (this.isOnline) {
      await this.processQueue()
    }
  }

  // Clear queue
  clearQueue(): void {
    this.queue.value = []
    this.errors.value = []
    this.saveQueue()
  }

  // Clear only errors
  clearErrors(): void {
    this.errors.value = []
  }

  // Get queue operations (for debugging/monitoring)
  getQueueOperations(): QueuedOperation[] {
    return [...this.queue.value]
  }
}

export const offlineQueue = new OfflineQueueService()