<template>
  <nav class="sticky top-0 z-90 grid grid-cols-2 bg-nav-background py-1 px-4">
    <RouterLink to="/stock-config" class="text-center"><MdiIcon icon="cog" size="lg" /></RouterLink>
    <RouterLink to="/shopping-list" class="text-center"
      ><MdiIcon icon="shopping-cart" size="lg"
    /></RouterLink>
  </nav>
  <main class="px-4 py-6">
    <RouterView />
  </main>
  <AddToShoppingListModal />
</template>

<script setup lang="ts">
import MdiIcon from "~/components/base/MdiIcon.vue"
import AddToShoppingListModal from "~/components/shopping-list/AddToShoppingListModal.vue"
</script>
