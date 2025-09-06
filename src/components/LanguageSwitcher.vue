<template>
  <div class="relative">
    <select
      v-model="locale"
      class="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
    >
      <option
        v-for="availableLocale in availableLocales"
        :key="availableLocale"
        :value="availableLocale"
      >
        {{ localeNames[availableLocale] || availableLocale }}
      </option>
    </select>

    <!-- Dropdown arrow -->
    <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
      <i class="i-mdi:chevron-down text-gray-400 text-lg"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "~/composables/useI18n"

const { locale, availableLocales, localeNames } = useI18n()
</script>
