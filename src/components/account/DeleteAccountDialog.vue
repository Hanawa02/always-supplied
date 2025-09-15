<template>
  <Dialog :open="open" @update:open="handleDialogClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="text-red-600">{{ m.account_delete_account_title() }}</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Warning -->
        <div class="p-4 bg-red-50 border border-red-200 rounded-md">
          <div class="flex">
            <i class="i-mdi:alert-circle text-red-400 mt-0.5 mr-3"></i>
            <div>
              <h3 class="text-sm font-medium text-red-800">
                {{ m.account_delete_warning_title() }}
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <ul class="list-disc pl-5 space-y-1">
                  <li>{{ m.account_delete_warning_data() }}</li>
                  <li>{{ m.account_delete_warning_buildings() }}</li>
                  <li>{{ m.account_delete_warning_permanent() }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Confirmation Input -->
        <div>
          <Label for="confirmText">
            {{ m.account_delete_confirmation_label() }}
            <span class="font-mono text-red-600">DELETE</span>
          </Label>
          <Input
            id="confirmText"
            v-model="confirmationText"
            :placeholder="m.account_delete_confirmation_placeholder()"
            :disabled="isLoading"
            class="mt-1"
          />
        </div>

        <!-- Error Message -->
        <div v-if="error" class="p-3 rounded-md bg-red-50 border border-red-200">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>

      <!-- Dialog Footer -->
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          @click="handleCancel"
          :disabled="isLoading"
        >
          {{ m.common_cancel() }}
        </Button>
        <Button
          type="button"
          variant="destructive"
          @click="handleConfirm"
          :disabled="isLoading || !isConfirmationValid"
        >
          <i v-if="isLoading" class="i-mdi:loading animate-spin mr-2"></i>
          {{ m.account_delete_confirm_button() }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useI18n } from '~/composables/useI18n'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': []
}>()

const { m } = useI18n()

// Form state
const confirmationText = ref('')
const isLoading = ref(false)
const error = ref('')

// Validation
const isConfirmationValid = computed(() => {
  return confirmationText.value === 'DELETE'
})

// Clear form when dialog closes
watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})

// Reset form
const resetForm = () => {
  confirmationText.value = ''
  error.value = ''
  isLoading.value = false
}

// Handle confirmation
const handleConfirm = async () => {
  if (!isConfirmationValid.value) {
    error.value = 'Please type "DELETE" to confirm'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    emit('confirm')
    handleCancel()
  } catch (err) {
    error.value = 'An error occurred while deleting your account'
  } finally {
    isLoading.value = false
  }
}

// Handle cancel
const handleCancel = () => {
  emit('update:open', false)
}

// Handle dialog close
const handleDialogClose = (open: boolean) => {
  if (!open) {
    emit('update:open', false)
  }
}
</script>