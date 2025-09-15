<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">{{ m.auth_callback_processing() }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { toast } from '~/components/ui/toast'
import { useI18n } from '~/composables/useI18n'
import { AuthService } from '~/services/authService'

const { m } = useI18n()
const router = useRouter()

onMounted(async () => {
  try {
    const { user, error } = await AuthService.handleAuthCallback()

    if (error) {
      toast({
        title: 'Authentication Failed',
        description: error,
        variant: 'destructive',
      })
      router.push('/auth/login')
      return
    }

    if (user) {
      toast({
        title: 'Welcome!',
        description: 'You have been signed in successfully.',
      })

      // Redirect to intended page or buildings page
      const redirect = router.currentRoute.value.query.redirect as string
      router.push(redirect || '/buildings')
    } else {
      router.push('/auth/login')
    }
  } catch (error) {
    console.error('Auth callback error:', error)
    toast({
      title: 'Authentication Error',
      description: 'An unexpected error occurred during authentication.',
      variant: 'destructive',
    })
    router.push('/auth/login')
  }
})
</script>