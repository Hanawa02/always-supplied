/**
 * Type adapters for converting between local and cloud data structures
 * Handles camelCase ↔ snake_case conversion and missing field mapping
 */

import type { BuyingItem, SupplyItem } from '~/types'
import type { Database } from '~/types/supabase'
import type { SuppliedBuilding } from '~/types/suppliedBuilding'

// Cloud types from database
type CloudBuilding = Database['public']['Tables']['cloud_buildings']['Row']
type CloudSupplyItem = Database['public']['Tables']['cloud_supply_items']['Row']
type CloudBuyingItem = Database['public']['Tables']['cloud_buying_items']['Row']

// Extended cloud types with proper relations
export interface CloudBuildingWithItems extends CloudBuilding {
  cloud_supply_items?: CloudSupplyItem[]
  cloud_buying_items?: CloudBuyingItem[]
}

/**
 * Converts SuppliedBuilding to CloudBuilding format
 */
export function suppliedBuildingToCloudBuilding(building: SuppliedBuilding): Partial<CloudBuilding> {
  return {
    local_id: building.id,
    name: building.name,
    description: building.description || null,
    location: null, // Not available in SuppliedBuilding
    created_at: building.createdAt.toISOString(),
    updated_at: building.updatedAt.toISOString(),
    synced_at: new Date().toISOString()
  }
}

/**
 * Converts CloudBuilding to SuppliedBuilding format
 */
export function cloudBuildingToSuppliedBuilding(cloudBuilding: CloudBuilding): SuppliedBuilding {
  return {
    id: cloudBuilding.local_id || cloudBuilding.id,
    name: cloudBuilding.name,
    description: cloudBuilding.description || undefined,
    createdAt: new Date(cloudBuilding.created_at),
    updatedAt: new Date(cloudBuilding.updated_at)
  }
}

/**
 * Converts SupplyItem to CloudSupplyItem format
 */
export function supplyItemToCloudSupplyItem(item: SupplyItem, buildingId: string): Partial<CloudSupplyItem> {
  return {
    local_id: item.id,
    building_id: buildingId,
    name: item.name,
    description: item.description || null,
    quantity: item.quantity,
    current_stock: item.quantity, // Map quantity to current_stock
    minimum_stock: 0, // Default value, not available in SupplyItem
    category: item.category || null,
    storage_room: item.storageRoom || null,
    shopping_hint: item.shoppingHint || null,
    preferred_brands: item.preferredBrands || null,
    notes: null, // Not available in SupplyItem
    created_at: item.createdAt.toISOString(),
    updated_at: item.updatedAt.toISOString(),
    last_updated: item.updatedAt.toISOString(),
    synced_at: new Date().toISOString()
  }
}

/**
 * Converts CloudSupplyItem to SupplyItem format
 */
export function cloudSupplyItemToSupplyItem(cloudItem: CloudSupplyItem): SupplyItem {
  return {
    id: cloudItem.local_id || cloudItem.id,
    name: cloudItem.name,
    description: cloudItem.description || undefined,
    quantity: cloudItem.current_stock || cloudItem.quantity,
    category: cloudItem.category || undefined,
    storageRoom: cloudItem.storage_room || undefined,
    shoppingHint: cloudItem.shopping_hint || undefined,
    preferredBrands: cloudItem.preferred_brands || undefined,
    buildingId: cloudItem.building_id,
    createdAt: new Date(cloudItem.created_at),
    updatedAt: new Date(cloudItem.last_updated || cloudItem.updated_at)
  }
}

/**
 * Converts BuyingItem to CloudBuyingItem format
 */
export function buyingItemToCloudBuyingItem(item: BuyingItem, buildingId: string): Partial<CloudBuyingItem> {
  return {
    local_id: item.id,
    building_id: buildingId,
    supply_item_id: item.supplyItemId || null,
    name: item.name,
    description: item.description || null,
    quantity: item.quantity,
    category: item.category || null,
    storage_room: item.storageRoom || null,
    shopping_hint: item.shoppingHint || null,
    preferred_brands: item.preferredBrands || null,
    notes: item.notes || null,
    urgency: 'medium', // Default value, not available in BuyingItem
    is_bought: item.isBought,
    is_purchased: item.isBought, // Map isBought to is_purchased
    added_at: item.addedAt.toISOString(),
    bought_at: item.boughtAt?.toISOString() || null,
    purchased_date: item.boughtAt?.toISOString() || null,
    created_at: item.addedAt.toISOString(),
    updated_at: new Date().toISOString(),
    synced_at: new Date().toISOString()
  }
}

/**
 * Converts CloudBuyingItem to BuyingItem format
 */
export function cloudBuyingItemToBuyingItem(cloudItem: CloudBuyingItem): BuyingItem {
  return {
    id: cloudItem.local_id || cloudItem.id,
    supplyItemId: cloudItem.supply_item_id || undefined,
    buildingId: cloudItem.building_id,
    name: cloudItem.name,
    description: cloudItem.description || undefined,
    quantity: cloudItem.quantity,
    shoppingHint: cloudItem.shopping_hint || undefined,
    category: cloudItem.category || undefined,
    storageRoom: cloudItem.storage_room || undefined,
    preferredBrands: cloudItem.preferred_brands || undefined,
    isBought: cloudItem.is_purchased || cloudItem.is_bought || false,
    addedAt: new Date(cloudItem.added_at || cloudItem.created_at),
    boughtAt: cloudItem.purchased_date ? new Date(cloudItem.purchased_date) :
              (cloudItem.bought_at ? new Date(cloudItem.bought_at) : undefined),
    notes: cloudItem.notes || undefined
  }
}

/**
 * Batch conversion functions for arrays
 */
export function convertSuppliedBuildingsToCloud(buildings: SuppliedBuilding[]): Partial<CloudBuilding>[] {
  return buildings.map(suppliedBuildingToCloudBuilding)
}

export function convertCloudBuildingsToSupplied(cloudBuildings: CloudBuilding[]): SuppliedBuilding[] {
  return cloudBuildings.map(cloudBuildingToSuppliedBuilding)
}

export function convertSupplyItemsToCloud(items: SupplyItem[], buildingId: string): Partial<CloudSupplyItem>[] {
  return items.map(item => supplyItemToCloudSupplyItem(item, buildingId))
}

export function convertCloudSupplyItemsToLocal(cloudItems: CloudSupplyItem[]): SupplyItem[] {
  return cloudItems.map(cloudSupplyItemToSupplyItem)
}

export function convertBuyingItemsToCloud(items: BuyingItem[], buildingId: string): Partial<CloudBuyingItem>[] {
  return items.map(item => buyingItemToCloudBuyingItem(item, buildingId))
}

export function convertCloudBuyingItemsToLocal(cloudItems: CloudBuyingItem[]): BuyingItem[] {
  return cloudItems.map(cloudBuyingItemToBuyingItem)
}

/**
 * Validation functions to ensure data integrity
 */
export function validateCloudBuilding(building: Partial<CloudBuilding>): boolean {
  return !!(building.name && building.local_id)
}

export function validateCloudSupplyItem(item: Partial<CloudSupplyItem>): boolean {
  return !!(item.name && item.building_id && item.local_id && typeof item.quantity === 'number')
}

export function validateCloudBuyingItem(item: Partial<CloudBuyingItem>): boolean {
  return !!(item.name && item.building_id && item.local_id && typeof item.quantity === 'number')
}

/**
 * Utility functions for handling sync metadata
 */
export function addSyncTimestamp<T extends Record<string, any>>(data: T): T & { synced_at: string } {
  return {
    ...data,
    synced_at: new Date().toISOString()
  }
}

export function updateSyncTimestamp<T extends Record<string, any>>(data: T): T & { updated_at: string; synced_at: string } {
  const now = new Date().toISOString()
  return {
    ...data,
    updated_at: now,
    synced_at: now
  }
}

/**
 * Helper to safely convert dates
 */
export function safeToDate(dateString: string | null | undefined): Date | undefined {
  if (!dateString) return undefined
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? undefined : date
  } catch {
    return undefined
  }
}

/**
 * Helper to safely convert to ISO string
 */
export function safeToISOString(date: Date | string | null | undefined): string | null {
  if (!date) return null
  try {
    if (typeof date === 'string') {
      return new Date(date).toISOString()
    }
    return date.toISOString()
  } catch {
    return null
  }
}