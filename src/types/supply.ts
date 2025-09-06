export interface SupplyItem {
  id: string
  name: string
  description?: string
  quantity: number
  category?: string
  storageRoom?: string
  shoppingHint?: string
  preferredBrands?: string[]
}

export interface CreateSupplyItem {
  name: string
  description?: string
  quantity: number
  category?: string
  storageRoom?: string
  shoppingHint?: string
  preferredBrands?: string[]
}

export interface UpdateSupplyItem extends Partial<CreateSupplyItem> {
  id: string
}

// Common categories for supply items
export const COMMON_CATEGORIES = [
  'Cleaning Supplies',
  'Personal Care',
  'Food & Beverages',
  'Paper Products',
  'Health & Medicine',
  'Laundry & Fabric Care',
  'Office Supplies',
  'Maintenance & Tools',
  'Pet Supplies',
  'Other',
] as const

// Common storage rooms
export const COMMON_STORAGE_ROOMS = [
  'Kitchen',
  'Bathroom',
  'Bedroom',
  'Living Room',
  'Garage',
  'Pantry',
  'Closet',
  'Office',
  'Storage Room',
  'Other',
] as const

export type Category = typeof COMMON_CATEGORIES[number]
export type StorageRoom = typeof COMMON_STORAGE_ROOMS[number]