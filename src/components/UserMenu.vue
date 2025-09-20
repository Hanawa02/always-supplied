<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="sm" class="flex items-center space-x-2">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <img
            v-if="userAvatar"
            :src="userAvatar"
            :alt="userName || 'User'"
            class="w-6 h-6 rounded-full object-cover"
          />
          <div v-else class="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
            <i class="i-mdi:account text-primary-600 text-sm"></i>
          </div>
        </div>

        <!-- User name (desktop only) -->
        <span v-if="userName" class="hidden lg:block text-sm font-medium text-gray-700">
          {{ userName }}
        </span>

        <!-- Dropdown arrow -->
        <i class="i-mdi:chevron-down w-4 h-4 text-gray-400"></i>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="w-56">
      <!-- User Info -->
      <div class="px-3 py-2 border-b border-gray-100">
        <p class="text-sm font-medium text-gray-900">{{ userName || "User" }}</p>
        <p v-if="userEmail" class="text-xs text-gray-500">{{ userEmail }}</p>
      </div>

      <!-- Menu Items -->
      <DropdownMenuItem as-child>
        <router-link
          to="/account"
          class="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <i class="i-mdi:account w-4 h-4 mr-3"></i>
          {{ m.account_title() }}
        </router-link>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        @click="handleSignOut"
        class="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <i class="i-mdi:logout w-4 h-4 mr-3"></i>
        {{ m.account_log_out() }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { toast } from "~/components/ui/toast"
import { use_auth } from "~/composables/use-auth"
import { useI18n } from "~/composables/useI18n"

const { m } = useI18n()
const { userName, userEmail, userAvatar, log_out } = use_auth()

const handleSignOut = async () => {
  console.log("[UserMenu] Starting sign out...")
  try {
    const { error } = await log_out()

    if (error) {
      console.error("[UserMenu] Sign out error:", error)
      toast({
        title: "Log Out Failed",
        description: error.message || "An error occurred while signing out.",
        variant: "destructive",
      })
      return
    }

    console.log("[UserMenu] Sign out successful")
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    })

    // Force navigation to login
    window.location.href = "/auth/login"
  } catch (error) {
    console.error("[UserMenu] Unexpected sign out error:", error)
    toast({
      title: "Log Out Failed",
      description: "An unexpected error occurred while signing out.",
      variant: "destructive",
    })
  }
}
</script>
