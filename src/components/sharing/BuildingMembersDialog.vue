<template>
  <Dialog :open="open" @update:open="handleDialogClose">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ m.sharing_building_members_title() }}</DialogTitle>
        <DialogDescription>
          {{ m.sharing_building_members_description() }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Members List -->
        <div v-if="members.length > 0" class="space-y-3">
          <div class="flex items-center justify-between">
            <Label>{{ m.sharing_members_list() }} ({{ members.length }})</Label>
            <Button variant="outline" size="sm" @click="refreshMembers" :disabled="isLoading">
              <i
                :class="isLoading ? 'i-mdi:loading animate-spin' : 'i-mdi:refresh'"
                class="w-4 h-4"
              ></i>
            </Button>
          </div>

          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="member in members"
              :key="member.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div class="flex items-center space-x-3">
                <!-- Avatar -->
                <div class="flex-shrink-0">
                  <img
                    v-if="member.profile?.avatarUrl"
                    :src="member.profile.avatarUrl"
                    :alt="member.profile?.fullName || 'User'"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center"
                  >
                    <i class="i-mdi:account text-primary-600 text-sm"></i>
                  </div>
                </div>

                <!-- Member Info -->
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900">
                    {{ member.profile?.fullName || "Unknown User" }}
                    <span v-if="member.userId === currentUserId" class="text-gray-500">(You)</span>
                  </p>
                  <p v-if="member.profile?.email" class="text-xs text-gray-500">
                    {{ member.profile.email }}
                  </p>
                  <p class="text-xs text-gray-400">
                    {{ formatJoinDate(member.joinedAt) }}
                  </p>
                </div>

                <!-- Role Badge -->
                <div class="flex-shrink-0">
                  <Badge :variant="member.role === 'owner' ? 'default' : 'secondary'">
                    {{ member.role === "owner" ? m.sharing_role_owner() : m.sharing_role_member() }}
                  </Badge>
                </div>
              </div>

              <!-- Actions -->
              <div
                v-if="
                  canManageMembers && member.role !== 'owner' && member.userId !== currentUserId
                "
                class="flex-shrink-0 ml-3"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  @click="removeMember(member)"
                  :disabled="isRemoving"
                  class="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <i class="i-mdi:account-remove w-4 h-4"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Members -->
        <div v-else-if="!isLoading" class="text-center py-6">
          <i class="i-mdi:account-group text-4xl text-gray-300 mb-2"></i>
          <p class="text-sm text-gray-500">{{ m.sharing_no_members() }}</p>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="text-center py-6">
          <i class="i-mdi:loading animate-spin text-2xl text-gray-400 mb-2"></i>
          <p class="text-sm text-gray-500">{{ m.common_loading() }}</p>
        </div>

        <!-- User Actions -->
        <div v-if="userRole === 'member'" class="pt-4 border-t">
          <Button
            variant="outline"
            class="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            @click="leaveBuilding"
            :disabled="isLeaving"
          >
            <i v-if="isLeaving" class="i-mdi:loading animate-spin mr-2"></i>
            <i v-else class="i-mdi:exit-to-app mr-2"></i>
            {{ m.sharing_leave_building() }}
          </Button>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="p-3 rounded-md bg-red-50 border border-red-200">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" @click="handleCancel">
          {{ m.common_close() }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Label } from "~/components/ui/label"
import { toast } from "~/components/ui/toast"
import { use_auth } from "~/composables/use-auth"
import { useI18n } from "~/composables/useI18n"
import { buildingSharing, type Member } from "~/services/sharingService"

interface Props {
  open: boolean
  buildingId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  "update:open": [value: boolean]
  memberRemoved: [memberId: string]
  buildingLeft: []
}>()

const { m } = useI18n()
const { user } = use_auth()

// State
const members = ref<Member[]>([])
const userRole = ref<"owner" | "member" | null>(null)
const isLoading = ref(false)
const isRemoving = ref(false)
const isLeaving = ref(false)
const error = ref("")

// Computed
const currentUserId = computed(() => user.value?.id)
const canManageMembers = computed(() => userRole.value === "owner")

// Load members when dialog opens
watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && props.buildingId) {
      await loadMembers()
      await loadUserRole()
    }
  },
)

const loadMembers = async () => {
  if (!props.buildingId) return

  isLoading.value = true
  error.value = ""

  try {
    const membersList = await buildingSharing.getBuildingMembers(props.buildingId)
    members.value = membersList
  } catch (err) {
    error.value = `Failed to load members: ${(err as Error).message}`
  } finally {
    isLoading.value = false
  }
}

const loadUserRole = async () => {
  if (!props.buildingId) return

  try {
    const role = await buildingSharing.getUserRole(props.buildingId)
    userRole.value = role
  } catch (err) {
    console.error("Failed to load user role:", err)
  }
}

const refreshMembers = async () => {
  await loadMembers()
}

const removeMember = async (member: Member) => {
  if (!props.buildingId) return

  const confirmed = confirm(
    `Are you sure you want to remove ${member.profile?.fullName || "this user"} from the building?`,
  )

  if (!confirmed) return

  isRemoving.value = true
  error.value = ""

  try {
    const result = await buildingSharing.removeMember(props.buildingId, member.userId)

    if (result.success) {
      // Remove from local list
      members.value = members.value.filter((m) => m.id !== member.id)

      toast({
        title: "Member Removed",
        description: `${member.profile?.fullName || "User"} has been removed from the building.`,
      })

      emit("memberRemoved", member.id)
    } else {
      error.value = result.error || "Failed to remove member"
    }
  } catch (err) {
    error.value = `Failed to remove member: ${(err as Error).message}`
  } finally {
    isRemoving.value = false
  }
}

const leaveBuilding = async () => {
  if (!props.buildingId) return

  const confirmed = confirm(
    "Are you sure you want to leave this building? You will no longer have access to its data.",
  )

  if (!confirmed) return

  isLeaving.value = true
  error.value = ""

  try {
    const result = await buildingSharing.leaveBuilding(props.buildingId)

    if (result.success) {
      toast({
        title: "Building Left",
        description: "You have successfully left the building.",
      })

      emit("buildingLeft")
      handleCancel()
    } else {
      error.value = result.error || "Failed to leave building"
    }
  } catch (err) {
    error.value = `Failed to leave building: ${(err as Error).message}`
  } finally {
    isLeaving.value = false
  }
}

const formatJoinDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return "Joined today"
  } else if (diffDays === 1) {
    return "Joined yesterday"
  } else if (diffDays < 30) {
    return `Joined ${diffDays} days ago`
  } else {
    return `Joined ${date.toLocaleDateString()}`
  }
}

const handleCancel = () => {
  emit("update:open", false)
}

const handleDialogClose = (open: boolean) => {
  if (!open) {
    emit("update:open", false)
  }
}
</script>
