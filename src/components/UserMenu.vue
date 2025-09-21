<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="sm" class="flex items-center py-4">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <img
            v-if="userAvatar"
            :src="userAvatar"
            :alt="userName || 'User'"
            class="w-6 h-6 rounded-full object-cover"
          />
          <div
            v-else
            class="w-6 h-6 rounded-full bg-primary-100 flex items-center uppercase justify-center"
          >
            {{ userName?.charAt(0) || userEmail?.charAt(0) }}
          </div>
        </div>

        <!-- User name (desktop only) -->
        <span v-if="userName" class="hidden lg:block text-sm font-normal">
          {{ userName }}
        </span>

        <!-- Dropdown arrow -->
        <i class="i-mdi:chevron-down w-4 h-4 text-gray-400"></i>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="w-56">
      <!-- Menu Items -->
      <DropdownMenuItem as-child>
        <router-link
          :to="ROUTES.ACCOUNT.path"
          class="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <i class="i-mdi:account w-4 h-4 text-green-600"></i>
          {{ m.account_title() }}
        </router-link>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        @click="handle_log_out"
        class="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
      >
        <i class="i-mdi:logout w-4 h-4 text-green-600"></i>
        {{ m.auth_log_out_button() }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"

import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { use_auth } from "~/composables/use-auth"
import { useI18n } from "~/composables/useI18n"
import { ROUTES } from "~/router/routes"

const { m } = useI18n()
const { userName, userEmail, userAvatar, log_out } = use_auth()

const router = useRouter()

const handle_log_out = async () => {
  await log_out()

  router.push(ROUTES.LOGIN.path)
}
</script>
