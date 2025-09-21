<template>
  <nav class="bg-white border-b border-gray-200 shadow-sm">
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-12 md:h-16"
    >
      <router-link
        :to="{ name: ROUTES.SUPPLIED_BUILDINGS.name }"
        class="flex items-center space-x-3 hover:opacity-80 transition-opacity"
      >
        <AppLogo class="h-6 md:h-8" variant="full" />
      </router-link>

      <!-- Desktop language switcher -->
      <div class="hidden md:contents">
        <DesktopNavigation />
      </div>

      <!-- Mobile menu -->
      <div class="contents md:hidden">
        <MobileNavigation />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import AppLogo from "~/components/AppLogo.vue"
import MobileNavigation from "~/components/navigation/MobileNavigation.vue"
import { useTypedRouter } from "~/composables/useRouter"

import DesktopNavigation from "./DesktopNavigation.vue"

const { ROUTES } = useTypedRouter()
</script>
