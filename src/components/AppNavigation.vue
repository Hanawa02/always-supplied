<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Left side -->
        <div class="flex items-center">
          <router-link 
            :to="{ name: ROUTES.SUPPLIED_BUILDINGS.name }"
            class="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <AppLogo class="h-8" variant="full" />
          </router-link>

          <!-- Desktop navigation -->
          <div class="hidden md:flex items-center ml-8 space-x-1">
            <router-link
              :to="{ name: ROUTES.SUPPLIED_BUILDINGS.name }"
              class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-primary-700 bg-primary-50"
            >
              {{ m.app.navigation.supplied_buildings() }}
            </router-link>
            <router-link
              :to="{ 
                name: ROUTES.SUPPLY_CONFIGURATION.name,
                query: selectedBuildingStore.selectedBuildingId ? { buildingId: selectedBuildingStore.selectedBuildingId } : {}
              }"
              class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex flex-col items-start"
              active-class="text-primary-700 bg-primary-50"
            >
              <span>{{ m.app.navigation.supply_configuration() }}</span>
              <span v-if="selectedBuildingStore.selectedBuilding" class="text-xs text-gray-400 truncate max-w-32">
                {{ selectedBuildingStore.selectedBuilding.name }}
              </span>
            </router-link>
            <router-link
              :to="{ name: ROUTES.THEME_PREVIEW.name }"
              class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-primary-700 bg-primary-50"
            >
              {{ m.app.navigation.theme_preview() }}
            </router-link>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center space-x-4">
          <!-- Desktop language switcher -->
          <div class="hidden md:block">
            <LanguageSwitcher />
          </div>

          <!-- Mobile menu button -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
            aria-expanded="false"
          >
            <span class="sr-only">Open main menu</span>
            <!-- Hamburger icon -->
            <svg v-if="!mobileMenuOpen" class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <!-- Close icon -->
            <svg v-else class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu drawer -->
    <div v-show="mobileMenuOpen" class="md:hidden">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity"
        @click="closeMobileMenu"
      ></div>
      
      <!-- Drawer -->
      <div class="fixed inset-y-0 right-0 w-64 bg-white shadow-xl z-50 transform transition-transform">
        <div class="flex flex-col h-full">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Menu</h2>
            <button
              @click="closeMobileMenu"
              class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Navigation -->
          <div class="flex-1 px-4 py-4 space-y-2">
            <router-link
              :to="{ name: ROUTES.SUPPLIED_BUILDINGS.name }"
              @click="closeMobileMenu"
              class="flex items-center px-3 py-3 text-sm font-medium text-gray-600 rounded-lg hover:text-primary-600 hover:bg-primary-50 transition-colors"
              active-class="text-primary-700 bg-primary-50"
            >
              <i class="i-mdi:office-building w-5 h-5 mr-3 text-gray-400"></i>
              {{ m.app.navigation.supplied_buildings() }}
            </router-link>
            
            <router-link
              :to="{ 
                name: ROUTES.SUPPLY_CONFIGURATION.name,
                query: selectedBuildingStore.selectedBuildingId ? { buildingId: selectedBuildingStore.selectedBuildingId } : {}
              }"
              @click="closeMobileMenu"
              class="flex flex-col px-3 py-3 text-sm font-medium text-gray-600 rounded-lg hover:text-primary-600 hover:bg-primary-50 transition-colors"
              active-class="text-primary-700 bg-primary-50"
            >
              <div class="flex items-center">
                <i class="i-mdi:package-variant w-5 h-5 mr-3 text-gray-400"></i>
                {{ m.app.navigation.supply_configuration() }}
              </div>
              <span v-if="selectedBuildingStore.selectedBuilding" class="text-xs text-gray-400 ml-8 mt-1">
                {{ selectedBuildingStore.selectedBuilding.name }}
              </span>
            </router-link>
            
            <router-link
              :to="{ name: ROUTES.THEME_PREVIEW.name }"
              @click="closeMobileMenu"
              class="flex items-center px-3 py-3 text-sm font-medium text-gray-600 rounded-lg hover:text-primary-600 hover:bg-primary-50 transition-colors"
              active-class="text-primary-700 bg-primary-50"
            >
              <i class="i-mdi:palette w-5 h-5 mr-3 text-gray-400"></i>
              {{ m.app.navigation.theme_preview() }}
            </router-link>
          </div>

          <!-- Footer -->
          <div class="border-t border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Language</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

import AppLogo from "~/components/AppLogo.vue"
import LanguageSwitcher from "~/components/LanguageSwitcher.vue"
import { useI18n } from "~/composables/useI18n"
import { useTypedRouter } from "~/composables/useRouter"
import { useSelectedBuildingStore } from "~/stores/selectedBuilding"

const { ROUTES } = useTypedRouter()
const { m } = useI18n()
const selectedBuildingStore = useSelectedBuildingStore()

// Mobile menu state
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

// Load selected building from storage on mount
onMounted(() => {
  selectedBuildingStore.loadFromStorage()
})
</script>