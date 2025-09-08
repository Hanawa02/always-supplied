import type { BuyingItem, CreateBuyingItem, UpdateBuyingItem } from '~/types/buyingItem'

import { db, generateId } from './database'

class BuyingItemsStorage {
  // Helper function to ensure data is properly serializable for IndexedDB
  private cleanForStorage(data: any): any {
    if (data === null || data === undefined) return data
    if (Array.isArray(data)) {
      // Create a clean array copy
      return data.map(item => this.cleanForStorage(item))
    }
    if (typeof data === 'object' && data instanceof Date) {
      return data
    }
    if (typeof data === 'object') {
      // Create clean object copy
      const cleaned: any = {}
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          cleaned[key] = this.cleanForStorage(data[key])
        }
      }
      return cleaned
    }
    return data
  }

  async create(data: CreateBuyingItem): Promise<BuyingItem> {
    const id = generateId()
    const buyingItem: BuyingItem = {
      id,
      supplyItemId: data.supplyItemId,
      buildingId: data.buildingId,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      shoppingHint: data.shoppingHint,
      category: data.category,
      storageRoom: data.storageRoom,
      // Clean the array to prevent Vue reactivity issues
      preferredBrands: data.preferredBrands ? this.cleanForStorage(data.preferredBrands) : undefined,
      notes: data.notes,
      isBought: false,
      addedAt: new Date(),
    }
    
    await db.buyingItems.add(buyingItem)
    return buyingItem
  }

  async update(id: string, updateData: Partial<UpdateBuyingItem>): Promise<BuyingItem | null> {
    const updates = { ...updateData }
    delete (updates as Partial<UpdateBuyingItem & { id?: string }>).id // Remove id from updates if present
    
    // Clean any array data in updates
    if (updates.preferredBrands) {
      updates.preferredBrands = this.cleanForStorage(updates.preferredBrands)
    }
    
    const updateCount = await db.buyingItems.where('id').equals(id).modify(updates)
    
    if (updateCount === 0) {
      return null
    }
    
    return await this.getById(id) || null
  }

  async updateFromData(updateData: UpdateBuyingItem): Promise<BuyingItem | null> {
    const { id, ...updates } = updateData
    return await this.update(id, updates)
  }

  async delete(id: string): Promise<boolean> {
    const deleteCount = await db.buyingItems.where('id').equals(id).delete()
    return deleteCount > 0
  }

  async getById(id: string): Promise<BuyingItem | undefined> {
    return await db.buyingItems.get(id)
  }

  async getAll(): Promise<BuyingItem[]> {
    return await db.buyingItems.orderBy('addedAt').reverse().toArray()
  }

  async getByBuildingId(buildingId: string): Promise<BuyingItem[]> {
    return await db.buyingItems.where('buildingId').equals(buildingId).sortBy('addedAt')
  }

  async getBySupplyItemId(supplyItemId: string): Promise<BuyingItem[]> {
    return await db.buyingItems.where('supplyItemId').equals(supplyItemId).sortBy('addedAt')
  }

  async getActiveItems(): Promise<BuyingItem[]> {
    return await db.buyingItems.where('isBought').equals(0).sortBy('addedAt')
  }

  async getBoughtItems(): Promise<BuyingItem[]> {
    return await db.buyingItems.where('isBought').equals(1).sortBy('boughtAt')
  }

  async toggleBought(id: string): Promise<BuyingItem | null> {
    const item = await this.getById(id)
    if (!item) return null
    
    return await this.update(id, { isBought: !item.isBought })
  }

  async markAsBought(id: string): Promise<BuyingItem | null> {
    return await this.update(id, { isBought: true })
  }

  async markAsNotBought(id: string): Promise<BuyingItem | null> {
    return await this.update(id, { isBought: false })
  }

  async clearBoughtItems(): Promise<number> {
    return await db.buyingItems.where('isBought').equals(1).delete()
  }

  async search(query: string): Promise<BuyingItem[]> {
    const lowercaseQuery = query.toLowerCase()
    
    return await db.buyingItems
      .filter((item: BuyingItem) => {
        return (
          item.name.toLowerCase().includes(lowercaseQuery) ||
          item.description?.toLowerCase().includes(lowercaseQuery) ||
          item.category?.toLowerCase().includes(lowercaseQuery) ||
          item.shoppingHint?.toLowerCase().includes(lowercaseQuery) ||
          item.notes?.toLowerCase().includes(lowercaseQuery)
        )
      })
      .toArray()
  }

  // Filter methods
  async filterByCategory(category: string): Promise<BuyingItem[]> {
    return await db.buyingItems.where('category').equals(category).sortBy('addedAt')
  }

  async getCount(): Promise<number> {
    return await db.buyingItems.count()
  }

  async getActiveCount(): Promise<number> {
    return await db.buyingItems.where('isBought').equals(0).count()
  }

  async getBoughtCount(): Promise<number> {
    return await db.buyingItems.where('isBought').equals(1).count()
  }
}

export const buyingItemsStorage = new BuyingItemsStorage()