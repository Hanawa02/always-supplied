<template>
  <Dialog :open="open" @update:open="handleDialogClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ m.sharing_share_building_title() }}</DialogTitle>
        <DialogDescription>
          {{ m.sharing_share_building_description() }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Share Options -->
        <div class="space-y-3">
          <div>
            <Label for="expiresIn">{{ m.sharing_expires_in_label() }}</Label>
            <select
              id="expiresIn"
              v-model="shareOptions.expiresIn"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              :disabled="isGenerating"
            >
              <option :value="null">{{ m.sharing_no_expiration() }}</option>
              <option :value="24">{{ m.sharing_expires_24h() }}</option>
              <option :value="72">{{ m.sharing_expires_3d() }}</option>
              <option :value="168">{{ m.sharing_expires_1w() }}</option>
            </select>
          </div>

          <div>
            <Label for="maxUses">{{ m.sharing_max_uses_label() }}</Label>
            <Input
              id="maxUses"
              v-model.number="shareOptions.maxUses"
              type="number"
              min="1"
              max="100"
              :placeholder="m.sharing_unlimited_uses()"
              :disabled="isGenerating"
              class="mt-1"
            />
          </div>
        </div>

        <!-- Current Share Code -->
        <div v-if="currentShareCode" class="space-y-3">
          <Label>{{ m.sharing_current_share_code() }}</Label>
          <div class="flex items-center space-x-2">
            <Input
              :value="currentShareCode"
              readonly
              class="font-mono"
            />
            <Button
              variant="outline"
              size="sm"
              @click="copyShareCode"
              :disabled="!currentShareCode"
            >
              <i class="i-mdi:content-copy w-4 h-4"></i>
            </Button>
          </div>
          <p class="text-xs text-gray-500">
            {{ m.sharing_share_code_instructions() }}
          </p>
        </div>

        <!-- Active Share Codes List -->
        <div v-if="activeShareCodes.length > 0" class="space-y-3">
          <Label>{{ m.sharing_active_codes() }}</Label>
          <div class="space-y-2 max-h-32 overflow-y-auto">
            <div
              v-for="share in activeShareCodes"
              :key="share.shareCode"
              class="flex items-center justify-between p-2 bg-gray-50 rounded border"
            >
              <div class="flex-1">
                <p class="font-mono text-sm">{{ share.shareCode }}</p>
                <p class="text-xs text-gray-500">
                  {{ formatShareInfo(share) }}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                @click="deactivateCode(share.shareCode)"
                :disabled="isDeactivating"
              >
                <i class="i-mdi:close w-4 h-4"></i>
              </Button>
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
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          @click="handleCancel"
          :disabled="isGenerating"
        >
          {{ m.common_close() }}
        </Button>
        <Button
          type="button"
          @click="generateShareCode"
          :disabled="isGenerating"
        >
          <i v-if="isGenerating" class="i-mdi:loading animate-spin mr-2"></i>
          {{ m.sharing_generate_code() }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { toast } from '~/components/ui/toast'
import { useI18n } from '~/composables/useI18n'
import { buildingSharing, type ShareInfo } from '~/services/sharingService'

interface Props {
  open: boolean
  buildingId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { m } = useI18n()

// Form state
const shareOptions = reactive({
  expiresIn: null as number | null,
  maxUses: null as number | null,
})

// UI state
const isGenerating = ref(false)
const isDeactivating = ref(false)
const currentShareCode = ref('')
const activeShareCodes = ref<ShareInfo[]>([])
const error = ref('')
const successMessage = ref('')

// Load active share codes when dialog opens
watch(() => props.open, async (isOpen) => {
  if (isOpen && props.buildingId) {
    await loadActiveShareCodes()
    resetMessages()
  }
})

const loadActiveShareCodes = async () => {
  try {
    const codes = await buildingSharing.getActiveShareCodes(props.buildingId)
    activeShareCodes.value = codes
  } catch (err) {
    error.value = `Failed to load share codes: ${(err as Error).message}`
  }
}

const generateShareCode = async () => {
  if (!props.buildingId) return

  isGenerating.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const result = await buildingSharing.generateShareCode(props.buildingId, {
      expiresIn: shareOptions.expiresIn || undefined,
      maxUses: shareOptions.maxUses || undefined,
    })

    if (result.success && result.shareCode) {
      currentShareCode.value = result.shareCode
      successMessage.value = 'Share code generated successfully!'

      // Reload active codes
      await loadActiveShareCodes()

      // Auto-copy to clipboard
      await copyShareCode()
    } else {
      error.value = result.error || 'Failed to generate share code'
    }
  } catch (err) {
    error.value = `Failed to generate share code: ${(err as Error).message}`
  } finally {
    isGenerating.value = false
  }
}

const copyShareCode = async () => {
  if (!currentShareCode.value) return

  try {
    await navigator.clipboard.writeText(currentShareCode.value)
    toast({
      title: 'Copied!',
      description: 'Share code copied to clipboard.',
    })
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = currentShareCode.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)

    toast({
      title: 'Copied!',
      description: 'Share code copied to clipboard.',
    })
  }
}

const deactivateCode = async (shareCode: string) => {
  isDeactivating.value = true
  error.value = ''

  try {
    const result = await buildingSharing.deactivateShareCode(shareCode)

    if (result.success) {
      toast({
        title: 'Code Deactivated',
        description: 'Share code has been deactivated.',
      })

      // Reload active codes
      await loadActiveShareCodes()

      // Clear current code if it was deactivated
      if (currentShareCode.value === shareCode) {
        currentShareCode.value = ''
      }
    } else {
      error.value = result.error || 'Failed to deactivate share code'
    }
  } catch (err) {
    error.value = `Failed to deactivate share code: ${(err as Error).message}`
  } finally {
    isDeactivating.value = false
  }
}

const formatShareInfo = (share: ShareInfo) => {
  const parts = []

  if (share.maxUses) {
    parts.push(`${share.currentUses}/${share.maxUses} uses`)
  } else {
    parts.push(`${share.currentUses} uses`)
  }

  if (share.expiresAt) {
    const expires = new Date(share.expiresAt)
    const now = new Date()
    const diffHours = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60))

    if (diffHours > 0) {
      if (diffHours < 24) {
        parts.push(`expires in ${diffHours}h`)
      } else {
        const diffDays = Math.ceil(diffHours / 24)
        parts.push(`expires in ${diffDays}d`)
      }
    } else {
      parts.push('expired')
    }
  }

  return parts.join(' • ')
}

const resetMessages = () => {
  error.value = ''
  successMessage.value = ''
  currentShareCode.value = ''
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