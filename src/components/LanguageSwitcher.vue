<template>
  <div class="group relative">
    <Select v-model="locale">
      <SelectTrigger class="w-full min-w-24">
        <SelectValue :placeholder="localeNames[locale]" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="availableLocale in availableLocales"
          :key="availableLocale"
          :value="availableLocale"
        >
          {{ localeNames[availableLocale] || availableLocale }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>

<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useI18n } from "~/composables/useI18n"

const { locale, availableLocales, localeNames } = useI18n()
</script>
