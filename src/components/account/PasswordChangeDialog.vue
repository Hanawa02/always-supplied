<template>
  <Dialog :open="open" @update:open="handleDialogClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ m.account_change_password_title() }}</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Current Password -->
        <div>
          <Label for="currentPassword">{{ m.account_current_password_label() }}</Label>
          <div class="relative mt-1">
            <Input
              id="currentPassword"
              v-model="form.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              :placeholder="m.account_current_password_placeholder()"
              :disabled="isLoading"
            />
            <button
              type="button"
              @click="showCurrentPassword = !showCurrentPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              :disabled="isLoading"
            >
              <i :class="showCurrentPassword ? 'i-mdi:eye-off' : 'i-mdi:eye'" class="text-gray-400 hover:text-gray-600"></i>
            </button>
          </div>
          <p v-if="errors.currentPassword" class="mt-1 text-sm text-red-600">
            {{ errors.currentPassword }}
          </p>
        </div>

        <!-- New Password -->
        <div>
          <Label for="newPassword">{{ m.account_new_password_label() }}</Label>
          <div class="relative mt-1">
            <Input
              id="newPassword"
              v-model="form.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              :placeholder="m.account_new_password_placeholder()"
              :disabled="isLoading"
            />
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              :disabled="isLoading"
            >
              <i :class="showNewPassword ? 'i-mdi:eye-off' : 'i-mdi:eye'" class="text-gray-400 hover:text-gray-600"></i>
            </button>
          </div>
          <p v-if="errors.newPassword" class="mt-1 text-sm text-red-600">
            {{ errors.newPassword }}
          </p>
          <p class="mt-1 text-xs text-gray-500">
            {{ m.auth_password_requirements() }}
          </p>
        </div>

        <!-- Confirm New Password -->
        <div>
          <Label for="confirmPassword">{{ m.account_confirm_password_label() }}</Label>
          <div class="relative mt-1">
            <Input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              :placeholder="m.account_confirm_password_placeholder()"
              :disabled="isLoading"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              :disabled="isLoading"
            >
              <i :class="showConfirmPassword ? 'i-mdi:eye-off' : 'i-mdi:eye'" class="text-gray-400 hover:text-gray-600"></i>
            </button>
          </div>
          <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="generalError" class="p-3 rounded-md bg-red-50 border border-red-200">
          <p class="text-sm text-red-600">{{ generalError }}</p>
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
            type="submit"
            :disabled="isLoading || !isFormValid"
          >
            <i v-if="isLoading" class="i-mdi:loading animate-spin mr-2"></i>
            {{ m.account_update_password() }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useAuth } from '~/composables/useAuth'
import { useI18n } from '~/composables/useI18n'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': []
}>()

const { m } = useI18n()
const { updatePassword } = useAuth()

// Form state
const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// UI state
const isLoading = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const generalError = ref('')

const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Validation
const isFormValid = computed(() => {
  return (
    form.currentPassword.length > 0 &&
    form.newPassword.length >= 6 &&
    form.confirmPassword === form.newPassword
  )
})

// Password strength validation
const getPasswordStrength = (password: string) => {
  let strength = 0
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  return strength
}

// Clear form when dialog closes
watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})

// Reset form
const resetForm = () => {
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''
  generalError.value = ''
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

// Clear errors when user types
const clearErrors = () => {
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''
  generalError.value = ''
}

// Handle form submission
const handleSubmit = async () => {
  clearErrors()

  // Validate form
  if (form.currentPassword.length === 0) {
    errors.currentPassword = 'Current password is required'
    return
  }

  if (form.newPassword.length < 6) {
    errors.newPassword = 'Password must be at least 6 characters'
    return
  }

  if (getPasswordStrength(form.newPassword) < 2) {
    errors.newPassword = 'Password is too weak. Include uppercase, lowercase, and numbers.'
    return
  }

  if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    return
  }

  if (form.currentPassword === form.newPassword) {
    errors.newPassword = 'New password must be different from current password'
    return
  }

  isLoading.value = true

  try {
    const { error } = await updatePassword(form.newPassword)

    if (error) {
      generalError.value = error.message
    } else {
      emit('success')
      handleCancel()
    }
  } catch (error) {
    generalError.value = 'An unexpected error occurred'
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