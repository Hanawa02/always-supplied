import Dexie, { type EntityTable, type Table } from 'dexie'

import type { BuyingItem } from '~/types/buyingItem'
import type { SuppliedBuilding } from '~/types/suppliedBuilding'
import type { SupplyItem } from '~/types/supply'

// Database interface extending our application types with proper typing
interface AlwaysSuppliedDB extends Dexie {
  suppliedBuildings: EntityTable<SuppliedBuilding, 'id'>
  supplyItems: EntityTable<SupplyItem, 'id'>
  buyingItems: EntityTable<BuyingItem, 'id'>
}

// Type-safe table references (used for type references in future extensions)
type SuppliedBuildingTable = Table<SuppliedBuilding, string>
type SupplyItemTable = Table<SupplyItem, string>
type BuyingItemTable = Table<BuyingItem, string>

// Database instance
const db = new Dexie('AlwaysSuppliedDB') as AlwaysSuppliedDB

// Schema definition - version 1
db.version(1).stores({
  suppliedBuildings: 'id, name, description, createdAt, updatedAt',
  supplyItems: 'id, name, buildingId, category, storageRoom, quantity, createdAt, updatedAt'
})

// Schema definition - version 2: Added buying items table
db.version(2).stores({
  suppliedBuildings: 'id, name, description, createdAt, updatedAt',
  supplyItems: 'id, name, buildingId, category, storageRoom, quantity, createdAt, updatedAt',
  buyingItems: 'id, supplyItemId, buildingId, name, isBought, category, addedAt, boughtAt'
})

// TypeScript hooks for data validation and transformation
db.suppliedBuildings.hook('creating', (_primKey: string, obj: SuppliedBuilding, _trans) => {
  // Ensure timestamps are set
  obj.createdAt = obj.createdAt || new Date()
  obj.updatedAt = obj.updatedAt || new Date()
})

db.suppliedBuildings.hook('updating', (modifications: Partial<SuppliedBuilding>, _primKey: string, _obj: SuppliedBuilding, _trans) => {
  // Update timestamp on modification
  modifications.updatedAt = new Date()
})

db.supplyItems.hook('creating', (_primKey: string, obj: SupplyItem, _trans) => {
  // Ensure timestamps are set
  obj.createdAt = obj.createdAt || new Date()
  obj.updatedAt = obj.updatedAt || new Date()
})

db.supplyItems.hook('updating', (modifications: Partial<SupplyItem>, _primKey: string, _obj: SupplyItem, _trans) => {
  // Update timestamp on modification
  modifications.updatedAt = new Date()
})

db.buyingItems.hook('creating', (_primKey: string, obj: BuyingItem, _trans) => {
  // Ensure timestamps are set
  obj.addedAt = obj.addedAt || new Date()
  obj.isBought = obj.isBought || false
})

db.buyingItems.hook('updating', (modifications: Partial<BuyingItem>, _primKey: string, obj: BuyingItem, _trans) => {
  // Set boughtAt timestamp when marking as bought
  if (modifications.isBought === true && !obj.boughtAt) {
    modifications.boughtAt = new Date()
  } else if (modifications.isBought === false) {
    modifications.boughtAt = undefined
  }
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

// Type-safe query builders
export const queries = {
  suppliedBuildings: {
    byName: (name: string) => db.suppliedBuildings.where('name').equals(name),
    byNamePattern: (pattern: string) => db.suppliedBuildings.where('name').startsWithIgnoreCase(pattern),
    recent: (limit: number = 10) => db.suppliedBuildings.orderBy('createdAt').reverse().limit(limit)
  },
  supplyItems: {
    byBuilding: (buildingId: string) => db.supplyItems.where('buildingId').equals(buildingId),
    byCategory: (category: string) => db.supplyItems.where('category').equals(category),
    byBuildingAndCategory: (buildingId: string, category: string) => 
      db.supplyItems.where('[buildingId+category]').equals([buildingId, category]),
    lowStock: (threshold: number = 5) => db.supplyItems.where('quantity').below(threshold),
    recent: (limit: number = 10) => db.supplyItems.orderBy('createdAt').reverse().limit(limit)
  }
} as const