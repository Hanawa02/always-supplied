<template>
  <div class="flex items-center">
    <MobileNavigationLink :to="ROUTES.SHOPPING_LIST.path">
      <i class="i-mdi:cart w-4 h-4 text-green-600"></i>
      {{ m.app_navigation_shopping_list() }}
    </MobileNavigationLink>
    <MobileNavigationLink :to="ROUTES.SUPPLY_CONFIGURATION.path">
      <i class="i-mdi:package-variant w-4 h-4 text-green-600"></i>
      {{ m.app_navigation_supply_configuration() }}
    </MobileNavigationLink>
    <MobileNavigationLink :to="ROUTES.SUPPLIED_BUILDINGS.path">
      <i class="i-mdi:office-building w-4 h-4 text-green-600"></i>
      {{ m.app_navigation_supplied_buildings() }}
    </MobileNavigationLink>
  </div>

  <div class="flex items-center gap-2">
    <LanguageSwitcher />

    <UserMenu v-if="is_authenticated" />

    <Button v-else size="default" @click="handle_log_in()" class="w-full">
      <i class="i-mdi:login w-4 h-4 text-white"></i>
      {{ m.auth_log_in_button() }}
    </Button>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router"

import LanguageSwitcher from "~/components/LanguageSwitcher.vue"
import MobileNavigationLink from "~/components/navigation/MobileNavigationLink.vue"
import { Button } from "~/components/ui/button"
import { use_auth } from "~/composables/use-auth"
import { useI18n } from "~/composables/useI18n"
import { ROUTES } from "~/router/routes"

import UserMenu from "../UserMenu.vue"

const { m } = useI18n()
const { is_authenticated } = use_auth()

const router = useRouter()

const handle_log_in = () => {
  router.push(ROUTES.LOGIN.path)
}
</script>
