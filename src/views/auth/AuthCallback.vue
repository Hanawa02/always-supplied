<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">{{ m.auth_callback_processing() }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Session } from "@supabase/supabase-js"
import { onMounted } from "vue"
import { useRouter } from "vue-router"

import { toast } from "~/components/ui/toast"
import { useI18n } from "~/composables/useI18n"
import { supabase } from "~/lib/supabase"
import { AuthService } from "~/services/authService"

const { m } = useI18n()
const router = useRouter()

onMounted(async () => {
  try {
    console.log("Auth callback started")

    // Check if we have OAuth tokens or errors in the URL
    const urlParams = new URLSearchParams(window.location.search)
    const hasTokens = urlParams.has("access_token") || urlParams.has("code")
    const hasError = urlParams.has("error")

    console.info("OAuth callback URL params:", window.location.search)

    // Check for OAuth errors first
    if (hasError) {
      const error = urlParams.get("error") || "Unknown error"
      const errorCode = urlParams.get("error_code") || ""
      const errorDescription = urlParams.get("error_description") || "Authentication failed"

      console.error("OAuth error in callback:", { error, errorCode, errorDescription })

      // Decode the error description (it's URL encoded)
      const decodedDescription = decodeURIComponent(errorDescription.replace(/\+/g, ' '))

      // Provide user-friendly error messages based on error type
      let userMessage = decodedDescription
      if (decodedDescription.includes("Database error saving new user")) {
        userMessage = "Unable to create your account. This may be a temporary issue. Please try again or contact support if the problem persists."
      }

      toast({
        title: "Authentication Failed",
        description: userMessage,
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (!hasTokens) {
      console.log("No OAuth tokens found in URL")
      toast({
        title: "Authentication Error",
        description: "No authentication tokens found. Please try signing in again.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    console.log("OAuth tokens detected in URL, waiting for Supabase to process...")

    // Listen for auth state change instead of polling
    const authStatePromise = new Promise((resolve, reject) => {
      const authCallback = async (event: string, session: Session | null) => {
        console.log("Auth state change:", event, session?.user?.id)

        if (event === "SIGNED_IN" && session?.user) {
          clearTimeout(timeoutId)
          subscription?.unsubscribe()

          try {
            console.log("User signed in successfully via auth state change")

            // Ensure user profile exists
            await AuthService.ensureUserProfile(session.user)

            resolve(session.user)
          } catch (error) {
            reject(error)
          }
        } else if (event === "SIGNED_OUT") {
          clearTimeout(timeoutId)
          subscription?.unsubscribe()
          reject(new Error("User was signed out during callback"))
        }
      }

      const { data } = supabase.auth.onAuthStateChange(authCallback)
      const subscription = data.subscription

      // Set a timeout in case auth state change never fires
      const timeoutId = setTimeout(() => {
        subscription?.unsubscribe()
        reject(new Error("Auth state change timeout"))
      }, 10000) // 10 second timeout
    })

    // Also try the polling approach as fallback
    const pollingPromise = (async () => {
      // Initial wait for Supabase to process the OAuth callback
      await new Promise((resolve) => setTimeout(resolve, 2000))

      let attempts = 0
      const maxAttempts = 3

      while (attempts < maxAttempts) {
        console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`)

        try {
          // Check session first
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

          if (!sessionError && sessionData.session?.user) {
            console.log("Session found via polling")
            await AuthService.ensureUserProfile(sessionData.session.user)
            return sessionData.session.user
          }

          // If no session, try getUser
          const { data: userData, error: userError } = await supabase.auth.getUser()

          if (!userError && userData.user) {
            console.log("User found via polling getUser")
            await AuthService.ensureUserProfile(userData.user)
            return userData.user
          }
        } catch (attemptError) {
          console.error(`Polling attempt ${attempts + 1} error:`, attemptError)
        }

        attempts++
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }

      throw new Error("Polling failed after all attempts")
    })()

    // Race between auth state change and polling
    await Promise.race([authStatePromise, pollingPromise])

    console.log("Authentication successful")
    toast({
      title: "Welcome!",
      description: "You have been logged in successfully.",
    })

    // Redirect to intended page or buildings page
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || "/buildings")
  } catch (error) {
    console.error("Auth callback error:", error)

    // More specific error messages
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    let userMessage = "An unexpected error occurred during authentication."

    if (errorMessage.includes("timeout")) {
      userMessage = "Authentication is taking longer than expected. Please try again."
    } else if (
      errorMessage.includes("session missing") ||
      errorMessage.includes("Auth session missing")
    ) {
      userMessage = "Authentication session was not established. Please try signing in again."
    } else if (errorMessage.includes("signed out")) {
      userMessage = "You were signed out during the authentication process. Please try again."
    }

    toast({
      title: "Authentication Error",
      description: userMessage,
      variant: "destructive",
    })
    router.push("/auth/login")
  }
})
</script>
