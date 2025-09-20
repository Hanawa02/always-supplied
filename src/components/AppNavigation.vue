<template>
  <nav class="bg-white border-b border-gray-200 shadow-sm">
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
            v-if="is_authenticated"
            variant="outline"
            size="sm"
            @click="showJoinDialog = true"
            class="hidden md:flex items-center space-x-1"
          >
            <i class="i-mdi:plus-circle w-4 h-4"></i>
            <span>{{ m.sharing_join_building() }}</span>
          </Button>

          <!-- User Menu (Desktop) -->
          <div v-if="is_authenticated" class="hidden md:block">
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

          <!-- Mobile menu -->
          <div class="md:hidden">
            <MobileNavigation />
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
import { use_selected_building_store } from "~/stores/selectedBuilding"
import type { Building } from "~/types"

import MobileNavigation from "./navigation/MobileNavigation.vue"

const { ROUTES } = useTypedRouter()
const { m } = useI18n()
const { is_authenticated, log_out } = use_auth()
const selectedBuildingStore = use_selected_building_store()
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
