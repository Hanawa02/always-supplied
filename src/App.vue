<template>
  <h1>Hello App!</h1>
  <p><strong>Current route path:</strong> {{ $route.fullPath }}</p>
  <nav class="grid grid-cols-1">
    <RouterLink to="/stock-config" class="bg-blue-300">Go to Stock Config </RouterLink>
    <RouterLink to="/shopping-list">Go to Shopping List</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>

<script setup lang="ts"></script>
