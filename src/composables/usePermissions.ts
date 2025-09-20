import { ref } from 'vue'

import { useAuth } from '~/composables/useAuth'
import { buildingSharing } from '~/services/sharingService'

export type Permission =
  | 'view_building'
  | 'edit_building'
  | 'delete_building'
  | 'share_building'
  | 'manage_members'
  | 'view_supplies'
  | 'edit_supplies'
  | 'view_shopping_list'
  | 'edit_shopping_list'

export type Role = 'owner' | 'member' | 'viewer' | null

export interface PermissionConfig {
  owner: Permission[]
  member: Permission[]
  viewer: Permission[]
}

const PERMISSION_CONFIG: PermissionConfig = {
  owner: [
    'view_building',
    'edit_building',
    'delete_building',
    'share_building',
    'manage_members',
    'view_supplies',
    'edit_supplies',
    'view_shopping_list',
    'edit_shopping_list'
  ],
  member: [
    'view_building',
    'view_supplies',
    'edit_supplies',
    'view_shopping_list',
    'edit_shopping_list'
  ],
  viewer: [
    'view_building',
    'view_supplies',
    'view_shopping_list'
  ]
}

export function usePermissions() {
  const { isAuthenticated } = useAuth()
  const buildingRoles = ref<Map<string, Role>>(new Map())

  // Get user's role for a specific building
  async function getBuildingRole(buildingId: string): Promise<Role> {
    if (!isAuthenticated.value) return null

    // Check cache first
    if (buildingRoles.value.has(buildingId)) {
      return buildingRoles.value.get(buildingId) || null
    }

    try {
      const role = await buildingSharing.getUserRole(buildingId)
      buildingRoles.value.set(buildingId, role)
      return role
    } catch {
      return null
    }
  }

  // Check if user has a specific permission for a building
  async function hasPermission(buildingId: string, permission: Permission): Promise<boolean> {
    if (!isAuthenticated.value) {
      // Allow viewing when not authenticated (local mode)
      return permission.startsWith('view_') || permission.startsWith('edit_')
    }

    const role = await getBuildingRole(buildingId)
    if (!role) return false

    return PERMISSION_CONFIG[role].includes(permission)
  }

  // Check multiple permissions at once
  async function hasPermissions(buildingId: string, permissions: Permission[]): Promise<boolean[]> {
    const results = await Promise.all(
      permissions.map(permission => hasPermission(buildingId, permission))
    )
    return results
  }

  // Check if user can perform an action (wrapper for common use cases)
  async function canViewBuilding(buildingId: string): Promise<boolean> {
    return await hasPermission(buildingId, 'view_building')
  }

  async function canEditBuilding(buildingId: string): Promise<boolean> {
    return await hasPermission(buildingId, 'edit_building')
  }

  async function canDeleteBuilding(buildingId: string): Promise<boolean> {
    return await hasPermission(buildingId, 'delete_building')
  }

  async function canShareBuilding(buildingId: string): Promise<boolean> {
    return await hasPermission(buildingId, 'share_building')
  }

  async function canManageMembers(buildingId: string): Promise<boolean> {
    return await hasPermission(buildingId, 'manage_members')
  }

  async function canViewSupplies(buildingId: string): Promise<boolean> {
    return await hasPermission(buildingId, 'view_supplies')
  }

  async function canEditSupplies(buildingId: string): Promise<boolean> {
    return await hasPermission(buildingId, 'edit_supplies')
  }

  async function canViewShoppingList(buildingId: string): Promise<boolean> {
    return await hasPermission(buildingId, 'view_shopping_list')
  }

  async function canEditShoppingList(buildingId: string): Promise<boolean> {
    return await hasPermission(buildingId, 'edit_shopping_list')
  }

  // Get all permissions for a building
  async function getBuildingPermissions(buildingId: string): Promise<Permission[]> {
    if (!isAuthenticated.value) {
      // Return basic permissions for local mode
      return [
        'view_building',
        'edit_building',
        'delete_building',
        'view_supplies',
        'edit_supplies',
        'view_shopping_list',
        'edit_shopping_list'
      ]
    }

    const role = await getBuildingRole(buildingId)
    if (!role) return []

    return PERMISSION_CONFIG[role]
  }

  // Clear cached roles (useful when user signs out or permissions change)
  function clearRoleCache() {
    buildingRoles.value.clear()
  }

  // Clear specific building role cache
  function clearBuildingRoleCache(buildingId: string) {
    buildingRoles.value.delete(buildingId)
  }

  // Get permission display info
  function getPermissionInfo(permission: Permission): { label: string; description: string } {
    const permissionInfo: Record<Permission, { label: string; description: string }> = {
      view_building: {
        label: 'View Building',
        description: 'Can view building details and basic information'
      },
      edit_building: {
        label: 'Edit Building',
        description: 'Can modify building name, description, and settings'
      },
      delete_building: {
        label: 'Delete Building',
        description: 'Can permanently delete the building'
      },
      share_building: {
        label: 'Share Building',
        description: 'Can generate share codes and invite other users'
      },
      manage_members: {
        label: 'Manage Members',
        description: 'Can add, remove, and manage building members'
      },
      view_supplies: {
        label: 'View Supplies',
        description: 'Can view supply inventory and stock levels'
      },
      edit_supplies: {
        label: 'Edit Supplies',
        description: 'Can add, edit, and remove supply items'
      },
      view_shopping_list: {
        label: 'View Shopping List',
        description: 'Can view items on the shopping list'
      },
      edit_shopping_list: {
        label: 'Edit Shopping List',
        description: 'Can add, edit, and remove items from shopping list'
      }
    }

    return permissionInfo[permission]
  }

  // Get role display info
  function getRoleInfo(role: Role): { label: string; description: string; color: string } | null {
    if (!role) return null

    const roleInfo: Record<NonNullable<Role>, { label: string; description: string; color: string }> = {
      owner: {
        label: 'Owner',
        description: 'Full access to all building features and settings',
        color: 'blue'
      },
      member: {
        label: 'Member',
        description: 'Can view and edit supplies and shopping lists',
        color: 'green'
      },
      viewer: {
        label: 'Viewer',
        description: 'Can only view building information and lists',
        color: 'gray'
      }
    }

    return roleInfo[role]
  }

  return {
    // Core permission checking
    hasPermission,
    hasPermissions,
    getBuildingRole,
    getBuildingPermissions,

    // Convenience methods
    canViewBuilding,
    canEditBuilding,
    canDeleteBuilding,
    canShareBuilding,
    canManageMembers,
    canViewSupplies,
    canEditSupplies,
    canViewShoppingList,
    canEditShoppingList,

    // Cache management
    clearRoleCache,
    clearBuildingRoleCache,

    // Display helpers
    getPermissionInfo,
    getRoleInfo,

    // Computed
    isAuthenticated,

    // Constants
    PERMISSION_CONFIG
  }
}