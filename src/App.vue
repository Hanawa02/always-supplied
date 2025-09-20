<script setup lang="ts">
import AppNavigation from "~/components/AppNavigation.vue"
import { Toaster } from "~/components/ui/toast"
</script>

<template>
  <div>
    <AppNavigation />
    <RouterView />
    <Toaster />
  </div>
</template>

<style scoped></style>
