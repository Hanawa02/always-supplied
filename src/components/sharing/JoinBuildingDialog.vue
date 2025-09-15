<template>
  <Dialog :open="open" @update:open="handleDialogClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ m.sharing_join_building_title() }}</DialogTitle>
        <DialogDescription>
          {{ m.sharing_join_building_description() }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Share Code Input -->
        <div>
          <Label for="shareCode">{{ m.sharing_share_code_label() }}</Label>
          <Input
            id="shareCode"
            v-model="shareCode"
            :placeholder="m.sharing_share_code_placeholder()"
            :disabled="isJoining"
            class="mt-1 font-mono uppercase"
            maxlength="6"
            @input="handleShareCodeInput"
          />
          <p class="mt-1 text-xs text-gray-500">
            {{ m.sharing_share_code_help() }}
          </p>
        </div>

        <!-- Building Preview -->
        <div v-if="buildingPreview" class="p-4 bg-gray-50 rounded-md border">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <i class="i-mdi:home text-primary-600"></i>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-gray-900">{{ buildingPreview.name }}</h4>
              <p v-if="buildingPreview.location" class="text-sm text-gray-500">
                {{ buildingPreview.location }}
              </p>
              <p v-if="buildingPreview.description" class="text-sm text-gray-600 mt-1">
                {{ buildingPreview.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="p-3 rounded-md bg-red-50 border border-red-200">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="p-3 rounded-md bg-green-50 border border-green-200">
          <p class="text-sm text-green-600">{{ successMessage }}</p>
        </div>

        <!-- Join Confirmation -->
        <div v-if="buildingPreview && !successMessage" class="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p class="text-sm text-blue-800">
            {{ m.sharing_join_confirmation() }}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          @click="handleCancel"
          :disabled="isJoining"
        >
          {{ m.common_cancel() }}
        </Button>
        <Button
          type="button"
          @click="joinBuilding"
          :disabled="isJoining || !shareCode || shareCode.length !== 6"
        >
          <i v-if="isJoining" class="i-mdi:loading animate-spin mr-2"></i>
          {{ m.sharing_join_building() }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { toast } from '~/components/ui/toast'
import { useCloudBuildings } from '~/composables/useCloudBuildings'
import { useI18n } from '~/composables/useI18n'
import { buildingSharing } from '~/services/sharingService'
import type { Building } from '~/types'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': [building: Building]
}>()

const { m } = useI18n()
const { createBuilding } = useCloudBuildings()

// Form state
const shareCode = ref('')
const buildingPreview = ref<Building | null>(null)

// UI state
const isJoining = ref(false)
const error = ref('')
const successMessage = ref('')

// Reset form when dialog opens/closes
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})

const resetForm = () => {
  shareCode.value = ''
  buildingPreview.value = null
  error.value = ''
  successMessage.value = ''
}

const handleShareCodeInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  // Convert to uppercase and limit to 6 characters
  target.value = target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  shareCode.value = target.value

  // Clear error when user types
  if (error.value) {
    error.value = ''
  }

  // Clear preview if code is incomplete
  if (shareCode.value.length !== 6) {
    buildingPreview.value = null
  }
}

const joinBuilding = async () => {
  if (!shareCode.value || shareCode.value.length !== 6) {
    error.value = 'Please enter a valid 6-character share code'
    return
  }

  isJoining.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const result = await buildingSharing.joinBuilding(shareCode.value)

    if (result.success && result.building) {
      // Add building to local storage
      await createBuilding({
        name: result.building.name,
        location: result.building.location,
        description: result.building.description,
        supplyItems: result.building.supplyItems || [],
        buyingItems: result.building.buyingItems || []
      })

      successMessage.value = `Successfully joined "${result.building.name}"!`
      buildingPreview.value = result.building

      toast({
        title: 'Building Joined!',
        description: `You are now a member of "${result.building.name}".`,
      })

      emit('success', result.building)

      // Close dialog after a delay
      setTimeout(() => {
        handleCancel()
      }, 2000)
    } else {
      error.value = result.error || 'Failed to join building'
    }
  } catch (err) {
    error.value = `Failed to join building: ${(err as Error).message}`
  } finally {
    isJoining.value = false
  }
}

const handleCancel = () => {
  emit('update:open', false)
}

const handleDialogClose = (open: boolean) => {
  if (!open) {
    emit('update:open', false)
  }
}
</script>