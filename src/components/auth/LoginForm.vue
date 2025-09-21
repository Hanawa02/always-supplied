<template>
  <Card class="mt-8">
    <CardContent class="p-6">
      <FormKit
        type="form"
        id="login-form"
        @submit="handle_submit"
        :validation-schema="login_schema"
        :actions="false"
      >
        <!-- Email Field -->
        <FormKit
          type="email"
          name="email"
          :label="m.auth_email_label()"
          :placeholder="m.auth_email_placeholder()"
          :disabled="isLoading"
          autocomplete="email"
          validation="required|email"
          :classes="{
            outer: 'mb-4',
            label: 'block text-sm font-medium mb-1',
            inner: 'relative',
            input:
              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500',
            help: 'text-xs text-gray-500 mt-1',
            messages: 'list-none p-0 mt-1',
            message: 'text-red-600 text-sm',
          }"
        />

        <!-- Password Field with Toggle -->
        <div class="mb-4">
          <FormKit
            :type="show_password ? 'text' : 'password'"
            name="password"
            :label="m.auth_password_label()"
            :placeholder="m.auth_password_placeholder()"
            :disabled="isLoading"
            autocomplete="current-password"
            validation="required|length:6"
            :classes="{
              outer: 'mb-0',
              label: 'block text-sm font-medium mb-1',
              inner: 'relative',
              input:
                'w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500',
              help: 'text-xs text-gray-500 mt-1',
              messages: 'list-none p-0 mt-1',
              message: 'text-red-600 text-sm',
            }"
          >
            <template #suffix>
              <button
                type="button"
                @click="toggle_password_visibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                :disabled="isLoading"
              >
                <i
                  :class="show_password ? 'i-mdi:eye-off' : 'i-mdi:eye'"
                  class="text-gray-400 hover:text-gray-600"
                ></i>
              </button>
            </template>
          </FormKit>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between mb-4">
          <FormKit
            type="checkbox"
            name="remember"
            :label="m.auth_remember_me()"
            :disabled="isLoading"
            :classes="{
              outer: 'flex items-center',
              wrapper: 'flex items-center',
              inner: 'mr-2',
              input: 'h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500',
              label: 'text-sm',
            }"
          />
          <router-link
            to="/auth/forgot-password"
            class="text-sm text-primary-600 hover:text-primary-500"
          >
            {{ m.auth_forgot_password() }}
          </router-link>
        </div>

        <!-- Error Message -->
        <div v-if="auth_error" class="p-3 rounded-md bg-red-50 border border-red-200 mb-4">
          <p class="text-sm text-red-600">{{ auth_error }}</p>
          <!-- Add clear session button if login is failing -->
          <button
            v-if="auth_error.includes('Invalid login') || auth_error.includes('session')"
            @click="handle_clear_session"
            type="button"
            class="mt-2 text-xs text-red-700 underline hover:no-underline"
          >
            Clear cached sessions and try again
          </button>
        </div>

        <!-- Submit Button -->
        <FormKit
          type="submit"
          :label="m.auth_sign_in()"
          :disabled="isLoading"
          :classes="{
            outer: 'mb-0',
            input:
              'w-full px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center',
          }"
        >
          <template #prefixIcon>
            <i v-if="isLoading" class="i-mdi:loading animate-spin mr-2"></i>
          </template>
        </FormKit>
      </FormKit>

      <!-- Divider -->
      <div class="mt-6 flex items-center gap-2">
        <div class="bg-gray-300 h-px w-full"></div>
        <div class="text-sm flex-shrink-0">
          {{ m.auth_or_continue_with() }}
        </div>
        <div class="bg-gray-300 h-px w-full"></div>
      </div>

      <!-- Google Sign In -->
      <GoogleLoginButton :loading="isLoading" @click="handle_google_sign_in" class="mt-4" />

      <!-- Sign Up Link -->
      <div class="text-center mt-6 text-sm text-gray-600">
        {{ m.auth_no_account() }}
        <router-link
          to="/auth/register"
          class="font-medium text-primary-600 hover:text-primary-500"
        >
          {{ m.auth_sign_up() }}
        </router-link>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { FormKit } from "@formkit/vue"
import { ref } from "vue"
import { useRouter } from "vue-router"

import GoogleLoginButton from "~/components/auth/GoogleLoginButton.vue"
import { Card, CardContent } from "~/components/ui/card"
import { toast } from "~/components/ui/toast"
import { use_auth } from "~/composables/use-auth"
import { useI18n } from "~/composables/useI18n"
import { clearAuthSession } from "~/lib/supabase"
import { login_schema, type LoginFormData } from "~/schemas/auth.schema"

const { m } = useI18n()
const { signIn, signInWithGoogle, isLoading } = use_auth()
const router = useRouter()

const show_password = ref(false)
const auth_error = ref("")

const toggle_password_visibility = () => {
  show_password.value = !show_password.value
}

const handle_submit = async (data: LoginFormData) => {
  auth_error.value = ""

  console.log("[Login] Attempting sign in for:", data.email)
  const { error } = await signIn(data.email, data.password)

  if (error) {
    console.error("[Login] Sign in error:", error)
    auth_error.value = error.message

    let error_message = error.message
    if (error.message.includes("Invalid login credentials")) {
      error_message = "Invalid email or password. Please check your credentials and try again."
    } else if (error.message.includes("Email not confirmed")) {
      error_message = "Please verify your email address before signing in."
    } else if (error.message.includes("Too many requests")) {
      error_message = "Too many login attempts. Please try again later."
    }

    toast({
      title: "Sign In Failed",
      description: error_message,
      variant: "destructive",
    })
  } else {
    console.log("[Login] Sign in successful")
    toast({
      title: "Welcome back!",
      description: "You have been logged in successfully.",
    })

    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || "/buildings")
  }
}

const handle_google_sign_in = async () => {
  auth_error.value = ""

  const { error } = await signInWithGoogle()

  if (error) {
    auth_error.value = error.message
    toast({
      title: "Google Sign In Failed",
      description: error.message,
      variant: "destructive",
    })
  }
}

const handle_clear_session = async () => {
  console.log("[Login] Clearing auth session cache...")
  const result = await clearAuthSession()

  if (result.success) {
    toast({
      title: "Sessions Cleared",
      description: "Authentication cache has been cleared. Please try logging in again.",
    })
    auth_error.value = ""
    window.location.reload()
  } else {
    toast({
      title: "Error",
      description: "Failed to clear sessions. Please try clearing your browser cache manually.",
      variant: "destructive",
    })
  }
}
</script>