export interface SuppliedBuilding {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateSuppliedBuilding {
  name: string
  description?: string
}

export interface UpdateSuppliedBuilding {
  id: string
  name: string
  description?: string
}

// Common building types for quick selection
export const COMMON_BUILDING_TYPES = [
  "Home",
  "Office",
  "Warehouse",
  "Retail Store",
  "Restaurant",
  "Hotel",
  "School",
  "Hospital",
  "Factory",
  "Other",
] as const

export type CommonBuildingType = (typeof COMMON_BUILDING_TYPES)[number]
