<script setup lang="ts">
import AppNavigation from "~/components/navigation/AppNavigation.vue"
import { Toaster } from "~/components/ui/toast"
</script>

<template>
  <div class="flex flex-col relative min-h-screen">
    <AppNavigation class="sticky top-0" />
    <RouterView class="flex-1" />
    <Toaster />
  </div>
</template>
