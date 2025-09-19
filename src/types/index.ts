import type { BuyingItem } from './buyingItem'
import type { SuppliedBuilding } from './suppliedBuilding'
import type { SupplyItem } from './supply'

// Extended Building type for cloud functionality
export interface Building {
  id: string
  name: string
  location?: string
  description?: string
  createdAt: string
  updatedAt: string
  supplyItems: SupplyItem[]
  buyingItems: BuyingItem[]
}

// Simple adapter functions for backward compatibility
// For production use, prefer the comprehensive adapters in ~/services/typeAdapters
export function suppliedBuildingToBuilding(suppliedBuilding: SuppliedBuilding): Building {
  return {
    id: suppliedBuilding.id,
    name: suppliedBuilding.name,
    description: suppliedBuilding.description,
    location: undefined,
    createdAt: suppliedBuilding.createdAt.toISOString(),
    updatedAt: suppliedBuilding.updatedAt.toISOString(),
    supplyItems: [], // These would need to be fetched separately
    buyingItems: [] // These would need to be fetched separately
  }
}

export function buildingToSuppliedBuilding(building: Building): SuppliedBuilding {
  return {
    id: building.id,
    name: building.name,
    description: building.description,
    createdAt: new Date(building.createdAt),
    updatedAt: new Date(building.updatedAt)
  }
}

// Re-export types for convenience
export type { BuyingItem } from './buyingItem'
export type { CreateSuppliedBuilding, SuppliedBuilding, UpdateSuppliedBuilding } from './suppliedBuilding'
export type { SupplyItem } from './supply'