<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">{{ m.account_title() }}</h1>
      <p class="mt-2 text-gray-600">{{ m.account_subtitle() }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Profile Card -->
      <div class="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{{ m.account_profile_section() }}</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- Avatar Section -->
            <div class="flex items-center space-x-6">
              <div class="relative">
                <img
                  v-if="userAvatar"
                  :src="userAvatar"
                  :alt="userName || 'User'"
                  class="w-20 h-20 rounded-full object-cover"
                />
                <div
                  v-else
                  class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center"
                >
                  <i class="i-mdi:account text-3xl text-primary-600"></i>
                </div>
                <button
                  @click="triggerFileInput"
                  class="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg border border-gray-200 hover:bg-gray-50"
                  :disabled="isUpdatingProfile"
                >
                  <i class="i-mdi:camera text-gray-600 text-sm"></i>
                </button>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarUpload"
                />
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ userName }}</h3>
                <p class="text-sm text-gray-500">{{ userEmail }}</p>
              </div>
            </div>

            <!-- Profile Form -->
            <form @submit.prevent="updateProfile" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label for="fullName">{{ m.account_full_name_label() }}</Label>
                  <Input
                    id="fullName"
                    v-model="profileForm.full_name"
                    :placeholder="m.account_full_name_placeholder()"
                    :disabled="isUpdatingProfile"
                  />
                </div>
                <div>
                  <Label for="email">{{ m.account_email_label() }}</Label>
                  <Input
                    id="email"
                    v-model="profileForm.email"
                    type="email"
                    :placeholder="m.account_email_placeholder()"
                    :disabled="isUpdatingProfile"
                  />
                </div>
              </div>

              <div>
                <Label for="locale">{{ m.account_language_label() }}</Label>
                <select
                  id="locale"
                  v-model="profileForm.preferred_locale"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  :disabled="isUpdatingProfile"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="pt">Português</option>
                </select>
              </div>

              <div class="flex justify-end">
                <Button type="submit" :disabled="isUpdatingProfile || !hasProfileChanges">
                  <i v-if="isUpdatingProfile" class="i-mdi:loading animate-spin mr-2"></i>
                  {{ m.account_save_profile() }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <!-- Account Info Sidebar -->
      <div class="space-y-6">
        <!-- Account Status -->
        <Card>
          <CardHeader>
            <CardTitle>{{ m.account_status_section() }}</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ m.account_status() }}</span>
              <Badge variant="default">{{ m.account_status_active() }}</Badge>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ m.account_member_since() }}</span>
              <span class="text-sm text-gray-900">{{ memberSince }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ m.account_buildings_count() }}</span>
              <span class="text-sm text-gray-900">{{ buildingsCount }}</span>
            </div>
          </CardContent>
        </Card>

        <!-- Security Section -->
        <Card>
          <CardHeader>
            <CardTitle>{{ m.account_security_section() }}</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <Button variant="outline" class="w-full" @click="showPasswordChangeDialog = true">
              {{ m.account_change_password() }}
            </Button>
            <div class="space-y-2">
              <Button
                variant="outline"
                class="w-full"
                @click="handleSignOut"
                :disabled="isSigningOut"
              >
                <i v-if="isSigningOut" class="i-mdi:loading animate-spin mr-2"></i>
                {{ m.account_log_out() }}
              </Button>
              <!-- Emergency logout button -->
              <Button
                variant="ghost"
                size="sm"
                class="w-full text-xs"
                @click="handleForceSignOut"
                :disabled="isSigningOut"
              >
                <i class="i-mdi:exit-to-app mr-1"></i>
                Force Log Out (if above fails)
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Danger Zone -->
        <Card class="border-red-200">
          <CardHeader>
            <CardTitle class="text-red-600">{{ m.account_danger_zone() }}</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-gray-600 mb-4">
              {{ m.account_delete_warning() }}
            </p>
            <Button variant="destructive" class="w-full" @click="showDeleteAccountDialog = true">
              {{ m.account_delete_account() }}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Password Change Dialog -->
    <PasswordChangeDialog
      v-model:open="showPasswordChangeDialog"
      @success="handlePasswordChangeSuccess"
    />

    <!-- Delete Account Dialog -->
    <DeleteAccountDialog v-model:open="showDeleteAccountDialog" @confirm="handleDeleteAccount" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"

import DeleteAccountDialog from "~/components/account/DeleteAccountDialog.vue"
import PasswordChangeDialog from "~/components/account/PasswordChangeDialog.vue"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { toast } from "~/components/ui/toast"
import { use_auth } from "~/composables/use-auth"
import { useCloudBuildings } from "~/composables/useCloudBuildings"
import { useI18n } from "~/composables/useI18n"

const { m } = useI18n()
const {
  user,
  profile,
  userEmail,
  userName,
  userAvatar,
  updateProfile: updateAuthProfile,
  log_out,
} = use_auth()
const { buildings } = useCloudBuildings()
const router = useRouter()

// Form state
const profileForm = reactive({
  full_name: "",
  email: "",
  preferred_locale: "en",
})

// UI state
const isUpdatingProfile = ref(false)
const isSigningOut = ref(false)
const showPasswordChangeDialog = ref(false)
const showDeleteAccountDialog = ref(false)
const fileInput = ref<HTMLInputElement>()

// Computed properties
const hasProfileChanges = computed(() => {
  if (!profile.value) return false

  return (
    profileForm.full_name !== (profile.value.full_name || "") ||
    profileForm.email !== (profile.value.email || "") ||
    profileForm.preferred_locale !== (profile.value.preferred_locale || "en")
  )
})

const memberSince = computed(() => {
  if (!user.value?.created_at) return ""
  return new Date(user.value.created_at).toLocaleDateString()
})

const buildingsCount = computed(() => {
  return buildings.value.length
})

// Initialize form with profile data
const initializeForm = () => {
  if (profile.value) {
    profileForm.full_name = profile.value.full_name || ""
    profileForm.email = profile.value.email || userEmail.value || ""
    profileForm.preferred_locale = profile.value.preferred_locale || "en"
  }
}

// Watch for profile changes
watch(profile, initializeForm, { immediate: true })

onMounted(() => {
  initializeForm()
})

// Update profile
const updateProfile = async () => {
  isUpdatingProfile.value = true

  try {
    const { error } = await updateAuthProfile({
      full_name: profileForm.full_name.trim() || null,
      email: profileForm.email.trim() || null,
      preferred_locale: profileForm.preferred_locale,
    })

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    }
  } catch {
    toast({
      title: "Update Failed",
      description: "An unexpected error occurred.",
      variant: "destructive",
    })
  } finally {
    isUpdatingProfile.value = false
  }
}

// Handle avatar upload
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // For now, just show a message that avatar upload isn't implemented
  toast({
    title: "Feature Coming Soon",
    description: "Avatar upload will be available in a future update.",
  })

  // Reset input
  target.value = ""
}

// Handle password change success
const handlePasswordChangeSuccess = () => {
  toast({
    title: "Password Updated",
    description: "Your password has been changed successfully.",
  })
}

// Handle sign out
const handleSignOut = async () => {
  console.log("[AccountPage] Starting sign out...")
  isSigningOut.value = true

  try {
    const { error } = await log_out()

    if (error) {
      console.error("[AccountPage] Sign out error:", error)
      toast({
        title: "Log Out Failed",
        description: error.message || "An error occurred while signing out.",
        variant: "destructive",
      })
      return
    }

    console.log("[AccountPage] Sign out successful")
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    })

    // Use replace to prevent going back to authenticated page
    router.replace("/auth/login")
  } catch (error) {
    console.error("[AccountPage] Unexpected sign out error:", error)
    toast({
      title: "Sign Out Failed",
      description: "An unexpected error occurred while signing out.",
      variant: "destructive",
    })
  } finally {
    isSigningOut.value = false
  }
}

// Force sign out (clears everything and redirects)
const handleForceSignOut = async () => {
  console.log("[AccountPage] Force sign out initiated...")
  isSigningOut.value = true

  try {
    // Clear all authentication data from storage
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes("supabase") || key.includes("sb-") || key.includes("auth"))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => {
      console.log("[AccountPage] Force removing:", key)
      localStorage.removeItem(key)
    })

    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      if (c.includes("sb-") || c.includes("supabase")) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      }
    })

    // Clear session storage
    sessionStorage.clear()

    console.log("[AccountPage] Force sign out complete, redirecting...")
    toast({
      title: "Force Log Out",
      description: "All authentication data cleared. Redirecting...",
    })

    // Hard redirect to login
    window.location.href = "/auth/login"
  } catch (error) {
    console.error("[AccountPage] Force sign out error:", error)
    toast({
      title: "Force Log Out Failed",
      description: "Please clear your browser cache manually.",
      variant: "destructive",
    })
  } finally {
    isSigningOut.value = false
  }
}

// Handle account deletion
const handleDeleteAccount = async () => {
  try {
    // Note: This would typically call a backend endpoint to delete the account
    toast({
      title: "Account Deletion",
      description: "Account deletion feature will be available soon.",
    })
  } catch {
    toast({
      title: "Deletion Failed",
      description: "An error occurred while deleting your account.",
      variant: "destructive",
    })
  }
}
</script>
