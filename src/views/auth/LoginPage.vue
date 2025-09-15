<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-bold text-gray-900">
          {{ m.auth_login_title() }}
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          {{ m.auth_login_subtitle() }}
        </p>
      </div>

      <!-- Login Form -->
      <Card class="mt-8">
        <CardContent class="p-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Email Field -->
            <div>
              <Label for="email">{{ m.auth_email_label() }}</Label>
              <Input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                :placeholder="m.auth_email_placeholder()"
                :disabled="isLoading"
                class="mt-1"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">
                {{ errors.email }}
              </p>
            </div>

            <!-- Password Field -->
            <div>
              <Label for="password">{{ m.auth_password_label() }}</Label>
              <div class="relative mt-1">
                <Input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  :placeholder="m.auth_password_placeholder()"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  :disabled="isLoading"
                >
                  <i :class="showPassword ? 'i-mdi:eye-off' : 'i-mdi:eye'" class="text-gray-400 hover:text-gray-600"></i>
                </button>
              </div>
              <p v-if="errors.password" class="mt-1 text-sm text-red-600">
                {{ errors.password }}
              </p>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <Checkbox id="remember" v-model="form.remember" :disabled="isLoading" />
                <Label for="remember" class="ml-2 text-sm">
                  {{ m.auth_remember_me() }}
                </Label>
              </div>
              <router-link
                to="/auth/forgot-password"
                class="text-sm text-primary-600 hover:text-primary-500"
              >
                {{ m.auth_forgot_password() }}
              </router-link>
            </div>

            <!-- Error Message -->
            <div v-if="authError" class="p-3 rounded-md bg-red-50 border border-red-200">
              <p class="text-sm text-red-600">{{ authError }}</p>
            </div>

            <!-- Submit Button -->
            <Button
              type="submit"
              class="w-full"
              :disabled="isLoading || !isFormValid"
            >
              <i v-if="isLoading" class="i-mdi:loading animate-spin mr-2"></i>
              {{ m.auth_sign_in() }}
            </Button>
          </form>

          <!-- Divider -->
          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">{{ m.auth_or_continue_with() }}</span>
              </div>
            </div>
          </div>

          <!-- Google Sign In -->
          <GoogleLoginButton
            :loading="isLoading"
            @click="handleGoogleSignIn"
            class="mt-4"
          />

          <!-- Sign Up Link -->
          <div class="text-center mt-6">
            <p class="text-sm text-gray-600">
              {{ m.auth_no_account() }}
              <router-link
                to="/auth/register"
                class="font-medium text-primary-600 hover:text-primary-500"
              >
                {{ m.auth_sign_up() }}
              </router-link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import GoogleLoginButton from '~/components/auth/GoogleLoginButton.vue'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { toast } from '~/components/ui/toast'
import { useAuth } from '~/composables/useAuth'
import { useI18n } from '~/composables/useI18n'

const { m } = useI18n()
const { signIn, signInWithGoogle, isLoading } = useAuth()
const router = useRouter()

// Form state
const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const showPassword = ref(false)
const authError = ref('')
const errors = reactive({
  email: '',
  password: '',
})

// Validation
const isFormValid = computed(() => {
  return form.email.length > 0 && form.password.length > 0
})

// Validate email format
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Clear errors when user types
const clearErrors = () => {
  errors.email = ''
  errors.password = ''
  authError.value = ''
}

// Handle form submission
const handleSubmit = async () => {
  clearErrors()

  // Validate form
  if (!validateEmail(form.email)) {
    errors.email = 'Please enter a valid email address'
    return
  }

  if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    return
  }

  // Attempt sign in
  const { error } = await signIn(form.email, form.password)

  if (error) {
    authError.value = error.message
    toast({
      title: 'Sign In Failed',
      description: error.message,
      variant: 'destructive',
    })
  } else {
    toast({
      title: 'Welcome back!',
      description: 'You have been signed in successfully.',
    })

    // Redirect to intended page or dashboard
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/buildings')
  }
}

// Handle Google sign in
const handleGoogleSignIn = async () => {
  clearErrors()

  const { error } = await signInWithGoogle()

  if (error) {
    authError.value = error.message
    toast({
      title: 'Google Sign In Failed',
      description: error.message,
      variant: 'destructive',
    })
  }
  // Success handling will be done by auth callback
}
</script>