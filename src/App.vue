<script setup lang="ts">
import AppNavigation from "~/components/navigation/AppNavigation.vue"
import { Toaster } from "~/components/ui/toast"
</script>

<template>
  <div class="relative">
    <AppNavigation class="sticky top-0" />
    <RouterView />
    <Toaster />
  </div>
</template>
