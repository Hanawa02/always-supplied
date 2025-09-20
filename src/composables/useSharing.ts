import { computed, ref } from "vue"

import { toast } from "~/components/ui/toast"
import { use_auth } from "~/composables/use-auth"
import { buildingSharing, type Member, type ShareInfo } from "~/services/sharingService"
import type { Building } from "~/types"

export function useSharing() {
  const { is_authenticated } = use_auth()

  // State
  const isGeneratingCode = ref(false)
  const isJoining = ref(false)
  const isLoadingMembers = ref(false)

  // Generate share code for a building
  async function generateShareCode(
    buildingId: string,
    options?: {
      expiresIn?: number
      maxUses?: number
    },
  ) {
    if (!is_authenticated.value) {
      throw new Error("Authentication required")
    }

    isGeneratingCode.value = true

    try {
      const result = await buildingSharing.generateShareCode(buildingId, options)

      if (result.success) {
        toast({
          title: "Share Code Generated",
          description: "Building share code has been created successfully.",
        })
        return result.shareCode
      } else {
        throw new Error(result.error)
      }
    } finally {
      isGeneratingCode.value = false
    }
  }

  // Join building using share code
  async function joinBuilding(shareCode: string): Promise<Building> {
    if (!is_authenticated.value) {
      throw new Error("Authentication required")
    }

    isJoining.value = true

    try {
      const result = await buildingSharing.joinBuilding(shareCode)

      if (result.success && result.building) {
        toast({
          title: "Building Joined!",
          description: `You are now a member of "${result.building.name}".`,
        })
        return result.building
      } else {
        throw new Error(result.error)
      }
    } finally {
      isJoining.value = false
    }
  }

  // Get building members
  async function getBuildingMembers(buildingId: string): Promise<Member[]> {
    if (!is_authenticated.value) {
      throw new Error("Authentication required")
    }

    isLoadingMembers.value = true

    try {
      return await buildingSharing.getBuildingMembers(buildingId)
    } finally {
      isLoadingMembers.value = false
    }
  }

  // Remove member from building
  async function removeMember(buildingId: string, memberUserId: string) {
    if (!is_authenticated.value) {
      throw new Error("Authentication required")
    }

    const result = await buildingSharing.removeMember(buildingId, memberUserId)

    if (result.success) {
      toast({
        title: "Member Removed",
        description: "User has been removed from the building.",
      })
    } else {
      throw new Error(result.error)
    }
  }

  // Leave building
  async function leaveBuilding(buildingId: string) {
    if (!is_authenticated.value) {
      throw new Error("Authentication required")
    }

    const result = await buildingSharing.leaveBuilding(buildingId)

    if (result.success) {
      toast({
        title: "Building Left",
        description: "You have successfully left the building.",
      })
    } else {
      throw new Error(result.error)
    }
  }

  // Get active share codes
  async function getActiveShareCodes(buildingId: string): Promise<ShareInfo[]> {
    if (!is_authenticated.value) {
      throw new Error("Authentication required")
    }

    return await buildingSharing.getActiveShareCodes(buildingId)
  }

  // Deactivate share code
  async function deactivateShareCode(shareCode: string) {
    if (!is_authenticated.value) {
      throw new Error("Authentication required")
    }

    const result = await buildingSharing.deactivateShareCode(shareCode)

    if (result.success) {
      toast({
        title: "Code Deactivated",
        description: "Share code has been deactivated.",
      })
    } else {
      throw new Error(result.error)
    }
  }

  // Get user's role in a building
  async function getUserRole(buildingId: string): Promise<"owner" | "member" | null> {
    if (!is_authenticated.value) {
      return null
    }

    return await buildingSharing.getUserRole(buildingId)
  }

  // Check if user can manage a building
  async function canManageBuilding(buildingId: string): Promise<boolean> {
    const role = await getUserRole(buildingId)
    return role === "owner"
  }

  // Check if user can edit building content
  async function canEditBuilding(buildingId: string): Promise<boolean> {
    const role = await getUserRole(buildingId)
    return role === "owner" || role === "member"
  }

  // Copy share code to clipboard
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Text copied to clipboard.",
      })
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)

      toast({
        title: "Copied!",
        description: "Text copied to clipboard.",
      })
    }
  }

  // Format share code for display
  function formatShareCode(code: string): string {
    return code.replace(/(.{3})(.{3})/, "$1-$2")
  }

  // Validate share code format
  function isValidShareCode(code: string): boolean {
    return /^[A-Z0-9]{6}$/.test(code.toUpperCase())
  }

  return {
    // State
    isGeneratingCode: computed(() => isGeneratingCode.value),
    isJoining: computed(() => isJoining.value),
    isLoadingMembers: computed(() => isLoadingMembers.value),

    // Actions
    generateShareCode,
    joinBuilding,
    getBuildingMembers,
    removeMember,
    leaveBuilding,
    getActiveShareCodes,
    deactivateShareCode,
    getUserRole,
    canManageBuilding,
    canEditBuilding,
    copyToClipboard,

    // Utilities
    formatShareCode,
    isValidShareCode,

    // Computed
    is_authenticated,
  }
}
