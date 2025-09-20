<template>
  <nav class="bg-white border-b border-gray-200 shadow-sm">
    <MobileNavigation />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-12 md:h-16">
        <!-- Left side -->
        <div class="flex items-center">
          <router-link
            :to="{ name: ROUTES.SUPPLIED_BUILDINGS.name }"
            class="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <AppLogo class="h-6 md:h-8" variant="full" />
          </router-link>

          <!-- Desktop navigation -->
          <div class="hidden md:flex items-center ml-8 gap-x-2">
            <router-link
              :to="{ name: ROUTES.SHOPPING_LIST.name }"
              class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-primary-700 bg-primary-50"
            >
              {{ m.app_navigation_shopping_list() }}
            </router-link>
            <router-link
              :to="
                selectedBuildingStore.selectedBuildingId
                  ? {
                      name: ROUTES.SUPPLY_CONFIGURATION.name,
                      params: { buildingId: selectedBuildingStore.selectedBuildingId },
                    }
                  : { name: ROUTES.SUPPLIED_BUILDINGS.name }
              "
              class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex flex-col items-start"
              active-class="text-primary-700 bg-primary-50"
            >
              <span>{{ m.app_navigation_supply_configuration() }}</span>
            </router-link>

            <router-link
              :to="{ name: ROUTES.SUPPLIED_BUILDINGS.name }"
              class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-primary-700 bg-primary-50"
            >
              {{ m.app_navigation_supplied_buildings() }}
            </router-link>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center space-x-4">
          <!-- Sync Status (Desktop) -->
          <div class="hidden md:block">
            <SyncStatusIndicator :compact="true" />
          </div>

          <!-- Join Building Button (Desktop) -->
          <Button
            v-if="isAuthenticated"
            variant="outline"
            size="sm"
            @click="showJoinDialog = true"
            class="hidden md:flex items-center space-x-1"
          >
            <i class="i-mdi:plus-circle w-4 h-4"></i>
            <span>{{ m.sharing_join_building() }}</span>
          </Button>

          <!-- User Menu (Desktop) -->
          <div v-if="isAuthenticated" class="hidden md:block">
            <UserMenu />
          </div>

          <!-- Sign In Button (Desktop) -->
          <Button
            v-else
            variant="outline"
            size="sm"
            @click="$router.push('/auth/login')"
            class="hidden md:flex"
          >
            {{ m.auth_sign_in() }}
          </Button>

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
            <svg
              v-if="!mobileMenuOpen"
              class="block h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            <!-- Close icon -->
            <svg
              v-else
              class="block h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
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
      <div
        class="fixed inset-y-0 right-0 w-64 bg-white shadow-xl z-50 transform transition-transform"
      >
        <div class="flex flex-col h-full">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Menu</h2>
            <button
              @click="closeMobileMenu"
              class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Navigation -->
          <div class="flex-1 px-4 py-4 space-y-2">
            <router-link
              :to="{ name: ROUTES.SHOPPING_LIST.name }"
              @click="closeMobileMenu"
              class="flex items-center px-3 py-3 text-sm font-medium text-gray-600 rounded-lg hover:text-primary-600 hover:bg-primary-50 transition-colors"
              active-class="text-primary-700 bg-primary-50"
            >
              <i class="i-mdi:cart w-5 h-5 mr-3 text-gray-400"></i>
              {{ m.app_navigation_shopping_list() }}
            </router-link>

            <router-link
              :to="
                selectedBuildingStore.selectedBuildingId
                  ? {
                      name: ROUTES.SUPPLY_CONFIGURATION.name,
                      params: { buildingId: selectedBuildingStore.selectedBuildingId },
                    }
                  : { name: ROUTES.SUPPLIED_BUILDINGS.name }
              "
              @click="closeMobileMenu"
              class="flex flex-col px-3 py-3 text-sm font-medium text-gray-600 rounded-lg hover:text-primary-600 hover:bg-primary-50 transition-colors"
              active-class="text-primary-700 bg-primary-50"
            >
              <div class="flex items-center">
                <i class="i-mdi:package-variant w-5 h-5 mr-3 text-gray-400"></i>
                {{ m.app_navigation_supply_configuration() }}
              </div>
              <span
                v-if="selectedBuildingStore.selectedBuilding"
                class="text-xs text-gray-400 ml-8 mt-1"
              >
                {{ selectedBuildingStore.selectedBuilding.name }}
              </span>
            </router-link>

            <router-link
              :to="{ name: ROUTES.SUPPLIED_BUILDINGS.name }"
              @click="closeMobileMenu"
              class="flex items-center px-3 py-3 text-sm font-medium text-gray-600 rounded-lg hover:text-primary-600 hover:bg-primary-50 transition-colors"
              active-class="text-primary-700 bg-primary-50"
            >
              <i class="i-mdi:office-building w-5 h-5 mr-3 text-gray-400"></i>
              {{ m.app_navigation_supplied_buildings() }}
            </router-link>
          </div>

          <!-- Mobile Actions -->
          <div class="border-t border-gray-200 p-4 space-y-3">
            <!-- Sync Status (Mobile) -->
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Sync Status</span>
              <SyncStatusIndicator :compact="true" />
            </div>

            <!-- Join Building (Mobile) -->
            <Button
              v-if="isAuthenticated"
              variant="outline"
              size="sm"
              @click="handleJoinButton()"
              class="w-full flex items-center justify-center space-x-2"
            >
              <i class="i-mdi:plus-circle w-4 h-4"></i>
              <span>{{ m.sharing_join_building() }}</span>
            </Button>

            <!-- Auth Actions (Mobile) -->
            <div v-if="isAuthenticated" class="space-y-2">
              <router-link
                to="/account"
                @click="closeMobileMenu"
                class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <i class="i-mdi:account w-4 h-4 mr-2"></i>
                {{ m.account_title() }}
              </router-link>
            </div>
            <Button v-else variant="outline" size="sm" @click="handleSignInClick()" class="w-full">
              {{ m.auth_sign_in() }}
            </Button>

            <!-- Language -->
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Language</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Join Building Dialog -->
    <JoinBuildingDialog v-model:open="showJoinDialog" @success="handleJoinSuccess" />
  </nav>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"

import AppLogo from "~/components/AppLogo.vue"
import LanguageSwitcher from "~/components/LanguageSwitcher.vue"
import JoinBuildingDialog from "~/components/sharing/JoinBuildingDialog.vue"
import { Button } from "~/components/ui/button"
import SyncStatusIndicator from "~/components/ui/SyncStatusIndicator.vue"
import { toast } from "~/components/ui/toast"
import UserMenu from "~/components/UserMenu.vue"
import { use_auth } from "~/composables/use-auth"
import { useI18n } from "~/composables/useI18n"
import { useTypedRouter } from "~/composables/useRouter"
import { useSelectedBuildingStore } from "~/stores/selectedBuilding"
import type { Building } from "~/types"

import MobileNavigation from "./navigation/MobileNavigation.vue"

const { ROUTES } = useTypedRouter()
const { m } = useI18n()
const { isAuthenticated, signOut } = use_auth()
const selectedBuildingStore = useSelectedBuildingStore()
const router = useRouter()

// Mobile menu state
const mobileMenuOpen = ref(false)
const showJoinDialog = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const handleJoinButton = () => {
  showJoinDialog.value = true
  closeMobileMenu()
}
// Handle successful building join
const handleJoinSuccess = (building: Building) => {
  toast({
    title: "Building Joined!",
    description: `You are now a member of "${building.name}".`,
  })
}

const handleSignInClick = () => {
  router.push("/auth/login")
  closeMobileMenu()
}

// Load selected building from storage on mount
onMounted(() => {
  selectedBuildingStore.loadFromStorage()
})
</script>
