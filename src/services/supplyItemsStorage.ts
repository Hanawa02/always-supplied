import { db, generateId, type StorageService } from './database'
import type { CreateSupplyItem, SupplyItem, UpdateSupplyItem } from '~/types/supply'

export class SupplyItemsStorage implements StorageService<SupplyItem> {
  async create(itemData: CreateSupplyItem): Promise<SupplyItem> {
    const newItem: SupplyItem = {
      id: generateId(),
      name: itemData.name,
      description: itemData.description,
      quantity: itemData.quantity,
      category: itemData.category,
      storageRoom: itemData.storageRoom,
      shoppingHint: itemData.shoppingHint,
      preferredBrands: itemData.preferredBrands || [],
      buildingId: itemData.buildingId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.supplyItems.add(newItem)
    return newItem
  }

  async update(id: string, updates: Partial<SupplyItem>): Promise<SupplyItem | null> {
    const existingItem = await db.supplyItems.get(id)
    if (!existingItem) return null

    const updatedItem: SupplyItem = {
      ...existingItem,
      ...updates,
      id, // Ensure ID is not overwritten
      updatedAt: new Date(),
    }

    await db.supplyItems.update(id, {
      ...updatedItem,
      updatedAt: new Date()
    })
    return updatedItem
  }

  async updateFromData(updateData: UpdateSupplyItem): Promise<SupplyItem | null> {
    return this.update(updateData.id, {
      name: updateData.name,
      description: updateData.description,
      quantity: updateData.quantity,
      category: updateData.category,
      storageRoom: updateData.storageRoom,
      shoppingHint: updateData.shoppingHint,
      preferredBrands: updateData.preferredBrands,
    })
  }

  async delete(id: string): Promise<boolean> {
    const deleteCount = await db.supplyItems.where('id').equals(id).delete()
    return deleteCount > 0
  }

  async getById(id: string): Promise<SupplyItem | undefined> {
    return await db.supplyItems.get(id)
  }

  async getAll(): Promise<SupplyItem[]> {
    return await db.supplyItems.orderBy('name').toArray()
  }

  async getByBuildingId(buildingId: string): Promise<SupplyItem[]> {
    return await db.supplyItems.where('buildingId').equals(buildingId).sortBy('name')
  }

  async search(query: string, fields: (keyof SupplyItem)[] = ['name', 'description', 'category']): Promise<SupplyItem[]> {
    const lowercaseQuery = query.toLowerCase()
    
    return await db.supplyItems
      .filter((item: SupplyItem) => {
        return fields.some((field) => {
          const value = item[field]
          return value && typeof value === 'string' && value.toLowerCase().includes(lowercaseQuery)
        })
      })
      .toArray()
  }

  // Filter methods
  async filterByCategory(category: string): Promise<SupplyItem[]> {
    return await db.supplyItems.where('category').equals(category).sortBy('name')
  }

  async filterByStorageRoom(storageRoom: string): Promise<SupplyItem[]> {
    return await db.supplyItems.where('storageRoom').equals(storageRoom).sortBy('name')
  }

  async filterByBuildingAndCategory(buildingId: string, category: string): Promise<SupplyItem[]> {
    return await db.supplyItems
      .where('[buildingId+category]')
      .equals([buildingId, category])
      .sortBy('name')
  }

  // Aggregate methods
  async getCount(): Promise<number> {
    return await db.supplyItems.count()
  }

  async getCountByBuilding(buildingId: string): Promise<number> {
    return await db.supplyItems.where('buildingId').equals(buildingId).count()
  }

  async getUniqueCategories(): Promise<string[]> {
    const items = await db.supplyItems.toArray()
    const categories = new Set(items.map(item => item.category).filter(Boolean) as string[])
    return Array.from(categories).sort()
  }

  async getUniqueStorageRooms(): Promise<string[]> {
    const items = await db.supplyItems.toArray()
    const storageRooms = new Set(items.map(item => item.storageRoom).filter(Boolean) as string[])
    return Array.from(storageRooms).sort()
  }

  // Bulk operations for performance
  async bulkDelete(ids: string[]): Promise<number> {
    return await db.supplyItems.where('id').anyOf(ids).delete()
  }

  async deleteByBuildingId(buildingId: string): Promise<number> {
    return await db.supplyItems.where('buildingId').equals(buildingId).delete()
  }
}

// Export singleton instance
export const supplyItemsStorage = new SupplyItemsStorage()