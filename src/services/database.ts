import Dexie, { type EntityTable, type Table } from 'dexie'
import type { SuppliedBuilding } from '~/types/suppliedBuilding'
import type { SupplyItem } from '~/types/supply'

// Database interface extending our application types with proper typing
interface AlwaysSuppliedDB extends Dexie {
  suppliedBuildings: EntityTable<SuppliedBuilding, 'id'>
  supplyItems: EntityTable<SupplyItem, 'id'>
}

// Type-safe table references
type SuppliedBuildingTable = Table<SuppliedBuilding, string>
type SupplyItemTable = Table<SupplyItem, string>

// Database instance
const db = new Dexie('AlwaysSuppliedDB') as AlwaysSuppliedDB

// Schema definition - version 1
db.version(1).stores({
  suppliedBuildings: 'id, name, description, createdAt, updatedAt',
  supplyItems: 'id, name, buildingId, category, storageRoom, quantity, createdAt, updatedAt'
})

// TypeScript hooks for data validation and transformation
db.suppliedBuildings.hook('creating', (primKey: string, obj: SuppliedBuilding, trans) => {
  // Ensure timestamps are set
  obj.createdAt = obj.createdAt || new Date()
  obj.updatedAt = obj.updatedAt || new Date()
})

db.suppliedBuildings.hook('updating', (modifications: Partial<SuppliedBuilding>, primKey: string, obj: SuppliedBuilding, trans) => {
  // Update timestamp on modification
  modifications.updatedAt = new Date()
})

db.supplyItems.hook('creating', (primKey: string, obj: SupplyItem, trans) => {
  // Ensure timestamps are set
  obj.createdAt = obj.createdAt || new Date()
  obj.updatedAt = obj.updatedAt || new Date()
})

db.supplyItems.hook('updating', (modifications: Partial<SupplyItem>, primKey: string, obj: SupplyItem, trans) => {
  // Update timestamp on modification
  modifications.updatedAt = new Date()
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