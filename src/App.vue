<script setup lang="ts">
import AppNavigation from "~/components/AppNavigation.vue"
import { Toaster } from "~/components/ui/toast"
</script>

<template>
  <div id="app">
    <AppNavigation />
    <RouterView />
    <Toaster />
  </div>
</template>

<style scoped></style>
