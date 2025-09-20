<template>
  <Drawer :direction="drawer_direction" v-model:open="is_open">
    <DrawerTrigger
      ><div class="flex"><i class="i-mdi:menu w-6 h-6 text-green-600"></i></div
    ></DrawerTrigger>

    <DrawerContent :position="drawer_direction">
      <DrawerClose as-child>
        <Button variant="ghost" class="ml-auto mt-2">
          <i class="i-mdi:close w-5 h-5 text-green-600"></i>
        </Button>
      </DrawerClose>
      <div class="gap-3 px-4 pb-4">
        <MobileNavigationLink :to="ROUTES.SHOPPING_LIST.path" @click="close_navigation">
          <i class="i-mdi:cart w-4 h-4 text-green-600"></i>
          {{ m.app_navigation_shopping_list() }}
        </MobileNavigationLink>
        <MobileNavigationLink :to="ROUTES.SUPPLIED_BUILDINGS.path" @click="close_navigation">
          <i class="i-mdi:office-building w-4 h-4 text-green-600"></i>
          {{ m.app_navigation_supplied_buildings() }}
        </MobileNavigationLink>
        <MobileNavigationLink
          v-if="selected_building_store.selectedBuilding"
          :to="{
            name: ROUTES.ACCOUNT.name,
            params: { buildingId: selected_building_store.selectedBuildingId },
          }"
          class="relative"
          @click="close_navigation"
        >
          <i class="i-mdi:package-variant w-4 h-4 text-green-600"></i>
          {{ m.app_navigation_supply_configuration() }}
          <span class="absolute left-2 top-5 text-xs text-green-800 font-light ml-8 mt-1">
            ({{ selected_building_store.selectedBuilding.name }})
          </span>
        </MobileNavigationLink>
        <MobileNavigationLink :to="ROUTES.SHOPPING_LIST.path" @click="close_navigation">
          <i class="i-mdi:cart w-4 h-4 text-green-600"></i>
          {{ m.app_navigation_shopping_list() }}
        </MobileNavigationLink>
      </div>
      <DrawerFooter>
        <div v-if="is_authenticated" class="mb-4">
          <MobileNavigationLink :to="ROUTES.ACCOUNT.path" @click="close_navigation">
            <i class="i-mdi:account w-4 h-4 text-green-600"></i>
            {{ m.account_title() }}
          </MobileNavigationLink>
          <Button
            variant="ghost"
            size="default"
            @click="handle_log_out"
            class="w-full text-left justify-start px-4 py-2"
          >
            <i class="i-mdi:logout w-4 h-4 text-green-600"></i>
            {{ m.auth_log_out_button() }}
          </Button>
        </div>
        <Button v-else size="lg" @click="handle_log_in()" class="w-full mb-4">
          <i class="i-mdi:login w-4 h-4 text-white"></i>
          {{ m.auth_log_in_button() }}
        </Button>
        <!-- Logout button -->
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"

import { Button } from "~/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "~/components/ui/drawer"
import { use_auth } from "~/composables/use-auth"
import { useI18n } from "~/composables/useI18n"
import { ROUTES } from "~/router/routes"
import { use_selected_building_store } from "~/stores/selectedBuilding"

import MobileNavigationLink from "./MobileNavigationLink.vue"

const drawer_direction = "right"
const is_open = ref(false)

const selected_building_store = use_selected_building_store()
const { m } = useI18n()
const { is_authenticated, log_out } = use_auth()

const router = useRouter()

const handle_log_out = async () => {
  await log_out()

  router.push(ROUTES.LOGIN.path)
}

const handle_log_in = () => {
  router.push(ROUTES.LOGIN.path)
}

const close_navigation = () => {
  is_open.value = false
}
</script>
