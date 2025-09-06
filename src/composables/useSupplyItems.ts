import { ref, computed } from 'vue'

import type { SupplyItem, CreateSupplyItem, UpdateSupplyItem } from '~/types/supply'

// Mock data for development (no storage as per requirements)
const mockSupplyItems: SupplyItem[] = [
  {
    id: '1',
    name: 'Paper Towels',
    description: 'Absorbent paper towels for kitchen use',
    quantity: 6,
    category: 'Paper Products',
    storageRoom: 'Kitchen',
    shoppingHint: 'Buy bulk pack for better value',
    preferredBrands: ['Bounty', 'Scott'],
  },
  {
    id: '2',
    name: 'Dish Soap',
    description: 'Liquid dish soap for washing dishes',
    quantity: 2,
    category: 'Cleaning Supplies',
    storageRoom: 'Kitchen',
    shoppingHint: 'Look for eco-friendly options',
    preferredBrands: ['Dawn', 'Palmolive'],
  },
  {
    id: '3',
    name: 'Toilet Paper',
    description: 'Soft toilet paper rolls',
    quantity: 12,
    category: 'Paper Products',
    storageRoom: 'Bathroom',
    shoppingHint: '2-ply preferred',
    preferredBrands: ['Charmin', 'Cottonelle'],
  },
]

export function useSupplyItems() {
  const supplyItems = ref<SupplyItem[]>([...mockSupplyItems])
  const isLoading = ref(false)

  // Computed values
  const totalItems = computed(() => supplyItems.value.length)
  const categories = computed(() => {
    const uniqueCategories = new Set(
      supplyItems.value.map(item => item.category).filter(Boolean)
    )
    return Array.from(uniqueCategories).sort()
  })

  const storageRooms = computed(() => {
    const uniqueRooms = new Set(
      supplyItems.value.map(item => item.storageRoom).filter(Boolean)
    )
    return Array.from(uniqueRooms).sort()
  })

  // Generate unique ID
  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  // CRUD operations
  const createSupplyItem = async (item: CreateSupplyItem): Promise<SupplyItem> => {
    isLoading.value = true
    try {
      const newItem: SupplyItem = {
        ...item,
        id: generateId(),
      }
      supplyItems.value.push(newItem)
      return newItem
    } finally {
      isLoading.value = false
    }
  }

  const updateSupplyItem = async (updatedItem: UpdateSupplyItem): Promise<SupplyItem | null> => {
    isLoading.value = true
    try {
      const index = supplyItems.value.findIndex(item => item.id === updatedItem.id)
      if (index === -1) return null

      const updated = { ...supplyItems.value[index], ...updatedItem }
      supplyItems.value[index] = updated
      return updated
    } finally {
      isLoading.value = false
    }
  }

  const deleteSupplyItem = async (id: string): Promise<boolean> => {
    isLoading.value = true
    try {
      const index = supplyItems.value.findIndex(item => item.id === id)
      if (index === -1) return false

      supplyItems.value.splice(index, 1)
      return true
    } finally {
      isLoading.value = false
    }
  }

  const getSupplyItem = (id: string): SupplyItem | undefined => {
    return supplyItems.value.find(item => item.id === id)
  }

  // Filter functions
  const filterByCategory = (category: string) => {
    return supplyItems.value.filter(item => item.category === category)
  }

  const filterByStorageRoom = (room: string) => {
    return supplyItems.value.filter(item => item.storageRoom === room)
  }

  const searchSupplyItems = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return supplyItems.value.filter(item =>
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.description?.toLowerCase().includes(lowercaseQuery) ||
      item.category?.toLowerCase().includes(lowercaseQuery)
    )
  }

  return {
    // State
    supplyItems: computed(() => supplyItems.value),
    isLoading: computed(() => isLoading.value),
    totalItems,
    categories,
    storageRooms,

    // CRUD operations
    createSupplyItem,
    updateSupplyItem,
    deleteSupplyItem,
    getSupplyItem,

    // Filters
    filterByCategory,
    filterByStorageRoom,
    searchSupplyItems,
  }
}