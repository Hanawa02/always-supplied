import Dexie, { type EntityTable } from 'dexie'
import type { SuppliedBuilding } from '~/types/suppliedBuilding'
import type { SupplyItem } from '~/types/supply'

// Database interface extending our application types
interface AlwaysSuppliedDB extends Dexie {
  suppliedBuildings: EntityTable<SuppliedBuilding, 'id'>
  supplyItems: EntityTable<SupplyItem, 'id'>
}

// Database instance
const db = new Dexie('AlwaysSuppliedDB') as AlwaysSuppliedDB

// Schema definition - version 1
db.version(1).stores({
  suppliedBuildings: 'id, name, description, createdAt, updatedAt',
  supplyItems: 'id, name, buildingId, category, storageRoom, quantity, createdAt, updatedAt'
})

// Optional: Add hooks for data validation or transformation
db.suppliedBuildings.hook('creating', function (primKey, obj, trans) {
  // Ensure timestamps are set
  const building = obj as SuppliedBuilding
  building.createdAt = building.createdAt || new Date()
  building.updatedAt = building.updatedAt || new Date()
})

db.suppliedBuildings.hook('updating', function (modifications, primKey, obj, trans) {
  // Update timestamp on modification
  ;(modifications as any).updatedAt = new Date()
})

db.supplyItems.hook('creating', function (primKey, obj, trans) {
  // Ensure timestamps are set
  const item = obj as SupplyItem
  item.createdAt = item.createdAt || new Date()
  item.updatedAt = item.updatedAt || new Date()
})

db.supplyItems.hook('updating', function (modifications, primKey, obj, trans) {
  // Update timestamp on modification
  ;(modifications as any).updatedAt = new Date()
})

export { db }
export type { AlwaysSuppliedDB }

// Generic storage service interface for future extensibility
export interface StorageService<T> {
  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>
  update(id: string, updates: Partial<T>): Promise<T | null>
  delete(id: string): Promise<boolean>
  getById(id: string): Promise<T | undefined>
  getAll(): Promise<T[]>
  search(query: string, fields: (keyof T)[]): Promise<T[]>
}

// Helper function to generate unique IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}