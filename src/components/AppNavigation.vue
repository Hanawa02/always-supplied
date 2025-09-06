<template>
  <nav class="bg-white border-b border-gray-200 px-4 py-3">
    <div class="flex items-center space-x-4">
      <h1 class="text-xl font-bold text-primary-700">Always Supplied</h1>

      <div class="flex space-x-4">
        <!-- Type-safe navigation using routes -->
        <router-link
          :to="{ name: ROUTES.SUPPLY_CONFIGURATION.name }"
          class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
          active-class="text-primary-700 bg-primary-50"
        >
          Supply Configuration
        </router-link>
        <router-link
          :to="{ name: ROUTES.THEME_PREVIEW.name }"
          class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
          active-class="text-primary-700 bg-primary-50"
        >
          Theme Preview
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useTypedRouter } from "~/composables/useRouter"

const { ROUTES } = useTypedRouter()
</script>
