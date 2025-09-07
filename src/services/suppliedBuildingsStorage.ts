import { db, generateId, type StorageService } from './database'
import type { CreateSuppliedBuilding, SuppliedBuilding, UpdateSuppliedBuilding } from '~/types/suppliedBuilding'

export class SuppliedBuildingsStorage implements StorageService<SuppliedBuilding> {
  async create(buildingData: CreateSuppliedBuilding): Promise<SuppliedBuilding> {
    const newBuilding: SuppliedBuilding = {
      id: generateId(),
      name: buildingData.name,
      description: buildingData.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.suppliedBuildings.add(newBuilding)
    return newBuilding
  }

  async update(id: string, updates: Partial<SuppliedBuilding>): Promise<SuppliedBuilding | null> {
    const existingBuilding = await db.suppliedBuildings.get(id)
    if (!existingBuilding) return null

    const updatedBuilding: SuppliedBuilding = {
      ...existingBuilding,
      ...updates,
      id, // Ensure ID is not overwritten
      updatedAt: new Date(),
    }

    await db.suppliedBuildings.update(id, updatedBuilding)
    return updatedBuilding
  }

  async updateFromData(updateData: UpdateSuppliedBuilding): Promise<SuppliedBuilding | null> {
    return this.update(updateData.id, {
      name: updateData.name,
      description: updateData.description,
    })
  }

  async delete(id: string): Promise<boolean> {
    const deleteCount = await db.suppliedBuildings.where('id').equals(id).delete()
    return deleteCount > 0
  }

  async getById(id: string): Promise<SuppliedBuilding | undefined> {
    return await db.suppliedBuildings.get(id)
  }

  async getAll(): Promise<SuppliedBuilding[]> {
    return await db.suppliedBuildings.orderBy('name').toArray()
  }

  async search(query: string, fields: (keyof SuppliedBuilding)[] = ['name', 'description']): Promise<SuppliedBuilding[]> {
    const lowercaseQuery = query.toLowerCase()
    
    return await db.suppliedBuildings
      .filter((building) => {
        return fields.some((field) => {
          const value = building[field]
          return value && typeof value === 'string' && value.toLowerCase().includes(lowercaseQuery)
        })
      })
      .toArray()
  }

  // Additional method to get building count
  async getCount(): Promise<number> {
    return await db.suppliedBuildings.count()
  }

  // Method to check if a building has associated supply items (for deletion validation)
  async hasSupplyItems(buildingId: string): Promise<boolean> {
    const count = await db.supplyItems.where('buildingId').equals(buildingId).count()
    return count > 0
  }
}

// Export singleton instance
export const suppliedBuildingsStorage = new SuppliedBuildingsStorage()