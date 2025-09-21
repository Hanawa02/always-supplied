<template>
  <div class="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="mt-6 text-3xl font-bold text-gray-900">
          {{ m.auth_login_subtitle() }}
        </h1>
      </div>

      <LoginForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from "~/components/auth/LoginForm.vue"
import { useI18n } from "~/composables/useI18n"

const { m } = useI18n()
</script>
