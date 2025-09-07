<template>
  <nav class="bg-white border-b border-gray-200 px-4 py-3">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center space-x-4">
        <router-link 
          :to="{ name: ROUTES.SUPPLY_CONFIGURATION.name }"
          class="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <AppLogo class="h-8" variant="full" />
        </router-link>

        <div class="hidden sm:flex space-x-4">
          <!-- Type-safe navigation using routes -->
          <router-link
            :to="{ name: ROUTES.SUPPLY_CONFIGURATION.name }"
            class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            active-class="text-primary-700 bg-primary-50"
          >
            {{ m.app.navigation.supply_configuration() }}
          </router-link>
          <router-link
            :to="{ name: ROUTES.THEME_PREVIEW.name }"
            class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            active-class="text-primary-700 bg-primary-50"
          >
            {{ m.app.navigation.theme_preview() }}
          </router-link>
        </div>
      </div>

      <!-- Language switcher -->
      <div class="flex items-center justify-between sm:justify-end">
        <!-- Mobile navigation -->
        <div class="flex sm:hidden space-x-2">
          <router-link
            :to="{ name: ROUTES.SUPPLY_CONFIGURATION.name }"
            class="text-gray-600 hover:text-primary-600 px-2 py-1 rounded text-sm font-medium"
            active-class="text-primary-700 bg-primary-50"
          >
            {{ m.app.navigation.supply_configuration() }}
          </router-link>
          <router-link
            :to="{ name: ROUTES.THEME_PREVIEW.name }"
            class="text-gray-600 hover:text-primary-600 px-2 py-1 rounded text-sm font-medium"
            active-class="text-primary-700 bg-primary-50"
          >
            {{ m.app.navigation.theme_preview() }}
          </router-link>
        </div>

        <LanguageSwitcher />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import AppLogo from "~/components/AppLogo.vue"
import LanguageSwitcher from "~/components/LanguageSwitcher.vue"
import { useI18n } from "~/composables/useI18n"
import { useTypedRouter } from "~/composables/useRouter"

const { ROUTES } = useTypedRouter()
const { m } = useI18n()
</script>
