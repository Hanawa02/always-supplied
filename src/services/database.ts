import Dexie, { type EntityTable, type Table } from "dexie"

import type { BuyingItem } from "~/types/buyingItem"
import type { SuppliedBuilding } from "~/types/suppliedBuilding"
import type { SupplyItem } from "~/types/supply"

// Database interface extending our application types with proper typing
interface AlwaysSuppliedDB extends Dexie {
  suppliedBuildings: EntityTable<SuppliedBuilding, "id">
  supplyItems: EntityTable<SupplyItem, "id">
  buyingItems: EntityTable<BuyingItem, "id">
}

// Type-safe table references (used for type references in future extensions)
// These types are preserved for potential future use or documentation purposes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SuppliedBuildingTable = Table<SuppliedBuilding, string>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SupplyItemTable = Table<SupplyItem, string>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type BuyingItemTable = Table<BuyingItem, string>

// Database instance
const db = new Dexie("AlwaysSuppliedDB") as AlwaysSuppliedDB

// Schema definition - version 1
db.version(1).stores({
  suppliedBuildings: "id, name, description, createdAt, updatedAt",
  supplyItems: "id, name, buildingId, category, storageRoom, quantity, createdAt, updatedAt",
})

// Schema definition - version 2: Added buying items table
db.version(2).stores({
  suppliedBuildings: "id, name, description, createdAt, updatedAt",
  supplyItems: "id, name, buildingId, category, storageRoom, quantity, createdAt, updatedAt",
  buyingItems: "id, supplyItemId, buildingId, name, isBought, category, addedAt, boughtAt",
})

// TypeScript hooks for data validation and transformation
db.suppliedBuildings.hook("creating", (_primKey, obj) => {
  // Ensure timestamps are set
  const building = obj as SuppliedBuilding
  building.createdAt = building.createdAt || new Date()
  building.updatedAt = building.updatedAt || new Date()
})

db.suppliedBuildings.hook("updating", (modifications) => {
  // Update timestamp on modification
  const mods = modifications as Partial<SuppliedBuilding>
  mods.updatedAt = new Date()
})

db.supplyItems.hook("creating", (_primKey, obj) => {
  // Ensure timestamps are set
  const item = obj as SupplyItem
  item.createdAt = item.createdAt || new Date()
  item.updatedAt = item.updatedAt || new Date()
})

db.supplyItems.hook("updating", (modifications) => {
  // Update timestamp on modification
  const mods = modifications as Partial<SupplyItem>
  mods.updatedAt = new Date()
})

db.buyingItems.hook("creating", (_primKey, obj) => {
  // Ensure timestamps are set
  const item = obj as BuyingItem
  item.addedAt = item.addedAt || new Date()
  item.isBought = item.isBought || false
})

db.buyingItems.hook("updating", (modifications, _primKey, obj) => {
  // Set boughtAt timestamp when marking as bought
  const mods = modifications as Partial<BuyingItem>
  const item = obj as BuyingItem
  if (mods.isBought === true && !item.boughtAt) {
    mods.boughtAt = new Date()
  } else if (mods.isBought === false) {
    mods.boughtAt = undefined
  }
})

export { db }
export type { AlwaysSuppliedDB }

// Generic storage service interface for future extensibility
export interface StorageService<T> {
  create(item: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>
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
    byName: (name: string) => db.suppliedBuildings.where("name").equals(name),
    byNamePattern: (pattern: string) =>
      db.suppliedBuildings.where("name").startsWithIgnoreCase(pattern),
    recent: (limit: number = 10) =>
      db.suppliedBuildings.orderBy("createdAt").reverse().limit(limit),
  },
  supplyItems: {
    byBuilding: (buildingId: string) => db.supplyItems.where("buildingId").equals(buildingId),
    byCategory: (category: string) => db.supplyItems.where("category").equals(category),
    byBuildingAndCategory: (buildingId: string, category: string) =>
      db.supplyItems.where("[buildingId+category]").equals([buildingId, category]),
    lowStock: (threshold: number = 5) => db.supplyItems.where("quantity").below(threshold),
    recent: (limit: number = 10) => db.supplyItems.orderBy("createdAt").reverse().limit(limit),
  },
} as const
