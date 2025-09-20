<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-bold text-gray-900">
          {{ m.auth_register_title() }}
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          {{ m.auth_register_subtitle() }}
        </p>
      </div>

      <!-- Registration Form -->
      <Card class="mt-8">
        <CardContent class="p-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Username Field -->
            <div>
              <Label for="username">{{ m.auth_username_label() }}</Label>
              <Input
                id="username"
                v-model="form.username"
                type="text"
                autocomplete="username"
                required
                :placeholder="m.auth_username_placeholder()"
                :disabled="isLoading"
                class="mt-1"
              />
              <p v-if="errors.username" class="mt-1 text-sm text-red-600">
                {{ errors.username }}
              </p>
            </div>

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
                  autocomplete="new-password"
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
                  <i
                    :class="showPassword ? 'i-mdi:eye-off' : 'i-mdi:eye'"
                    class="text-gray-400 hover:text-gray-600"
                  ></i>
                </button>
              </div>
              <p v-if="errors.password" class="mt-1 text-sm text-red-600">
                {{ errors.password }}
              </p>
              <p class="mt-1 text-xs text-gray-500">
                {{ m.auth_password_requirements() }}
              </p>
            </div>

            <!-- Confirm Password Field -->
            <div>
              <Label for="confirmPassword">{{ m.auth_confirm_password_label() }}</Label>
              <div class="relative mt-1">
                <Input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  :placeholder="m.auth_confirm_password_placeholder()"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  :disabled="isLoading"
                >
                  <i
                    :class="showConfirmPassword ? 'i-mdi:eye-off' : 'i-mdi:eye'"
                    class="text-gray-400 hover:text-gray-600"
                  ></i>
                </button>
              </div>
              <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
                {{ errors.confirmPassword }}
              </p>
            </div>

            <!-- Terms and Conditions -->
            <div class="flex items-start">
              <Checkbox id="terms" v-model="form.acceptTerms" :disabled="isLoading" class="mt-1" />
              <Label for="terms" class="ml-2 text-sm">
                {{ m.auth_accept_terms_start() }}
                <a href="/terms" target="_blank" class="text-primary-600 hover:text-primary-500">
                  {{ m.auth_terms_of_service() }}
                </a>
                {{ m.auth_accept_terms_and() }}
                <a href="/privacy" target="_blank" class="text-primary-600 hover:text-primary-500">
                  {{ m.auth_privacy_policy() }}
                </a>
              </Label>
            </div>
            <p v-if="errors.acceptTerms" class="text-sm text-red-600">
              {{ errors.acceptTerms }}
            </p>

            <!-- Error Message -->
            <div v-if="authError" class="p-3 rounded-md bg-red-50 border border-red-200">
              <p class="text-sm text-red-600">{{ authError }}</p>
            </div>

            <!-- Success Message -->
            <div
              v-if="registrationSuccess"
              class="p-3 rounded-md bg-green-50 border border-green-200"
            >
              <p class="text-sm text-green-600">{{ m.auth_registration_success() }}</p>
            </div>

            <!-- Submit Button -->
            <Button type="submit" class="w-full" :disabled="isLoading || !isFormValid">
              <i v-if="isLoading" class="i-mdi:loading animate-spin mr-2"></i>
              {{ m.auth_create_account() }}
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
          <GoogleLoginButton :loading="isLoading" @click="handleGoogleSignIn" class="mt-4" />

          <!-- Sign In Link -->
          <div class="text-center mt-6">
            <p class="text-sm text-gray-600">
              {{ m.auth_have_account() }}
              <router-link
                to="/auth/login"
                class="font-medium text-primary-600 hover:text-primary-500"
              >
                {{ m.auth_sign_in() }}
              </router-link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import { useRouter } from "vue-router"

import GoogleLoginButton from "~/components/auth/GoogleLoginButton.vue"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { toast } from "~/components/ui/toast"
import { useAuth } from "~/composables/useAuth"
import { useI18n } from "~/composables/useI18n"

const { m } = useI18n()
const { signUp, signInWithGoogle, isLoading } = useAuth()
const router = useRouter()

// Form state
const form = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const authError = ref("")
const registrationSuccess = ref(false)

const errors = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: "",
})

// Validation
const isFormValid = computed(() => {
  return (
    form.username.length > 0 &&
    form.email.length > 0 &&
    form.password.length >= 6 &&
    form.confirmPassword === form.password &&
    form.acceptTerms
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

// Validate email format
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Clear errors when user types
const clearErrors = () => {
  errors.username = ""
  errors.email = ""
  errors.password = ""
  errors.confirmPassword = ""
  errors.acceptTerms = ""
  authError.value = ""
}

// Handle form submission
const handleSubmit = async () => {
  clearErrors()

  // Validate form
  if (form.username.trim().length < 2) {
    errors.username = "Username must be at least 2 characters"
    return
  }

  if (!validateEmail(form.email)) {
    errors.email = "Please enter a valid email address"
    return
  }

  if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters"
    return
  }

  if (getPasswordStrength(form.password) < 2) {
    errors.password = "Password is too weak. Include uppercase, lowercase, and numbers."
    return
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match"
    return
  }

  if (!form.acceptTerms) {
    errors.acceptTerms = "You must accept the terms and conditions"
    return
  }

  // Attempt sign up
  const { data, error } = await signUp(form.email, form.password, {
    username: form.username.trim(),
  })

  if (error) {
    authError.value = error.message
    toast({
      title: "Registration Failed",
      description: error.message,
      variant: "destructive",
    })
  } else if (data.user) {
    registrationSuccess.value = true
    toast({
      title: "Account Created!",
      description: "Please check your email to verify your account.",
    })

    // Redirect to login page after a delay
    setTimeout(() => {
      router.push("/auth/login")
    }, 2000)
  }
}

// Handle Google sign in
const handleGoogleSignIn = async () => {
  clearErrors()

  const { error } = await signInWithGoogle()

  if (error) {
    console.error(error)
    authError.value = error.message
    toast({
      title: "Google Sign In Failed",
      description: error.message,
      variant: "destructive",
    })
  }
  // Success handling will be done by auth callback
}
</script>
