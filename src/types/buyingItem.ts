/**
 * Represents an item in the shopping list (buying list)
 * These are items that need to be purchased
 */
export interface BuyingItem {
  id: string
  // Reference to the supply item configuration
  supplyItemId?: string
  // Building this item belongs to (for filtering)
  buildingId?: string
  // Item details (can be customized from supply item)
  name: string
  description?: string
  quantity: number
  shoppingHint?: string
  category?: string
  storageRoom?: string
  preferredBrands?: string[]
  // Shopping list specific fields
  isBought: boolean
  addedAt: Date
  boughtAt?: Date
  // Allow custom notes for this shopping instance
  notes?: string
}

/**
 * Data transfer object for creating a buying item
 */
export interface CreateBuyingItem {
  supplyItemId?: string
  buildingId?: string
  name: string
  description?: string
  quantity: number
  shoppingHint?: string
  category?: string
  storageRoom?: string
  preferredBrands?: string[]
  notes?: string
}

/**
 * Data transfer object for updating a buying item
 */
export interface UpdateBuyingItem {
  id: string
  name?: string
  description?: string
  quantity?: number
  shoppingHint?: string
  category?: string
  storageRoom?: string
  preferredBrands?: string[]
  isBought?: boolean
  notes?: string
}