<template>
  <div class="text-center py-12">
    <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <i :class="iconClasses"></i>
    </div>
    <h3 class="text-lg font-medium text-gray-900 mb-2">{{ title }}</h3>
    <p class="text-gray-600 mb-6">{{ description }}</p>
    <slot name="actions">
      <BaseButton
        v-if="actionLabel"
        variant="primary"
        @click="$emit('action')"
      >
        {{ actionLabel }}
      </BaseButton>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import BaseButton from './BaseButton.vue'

interface Props {
  title: string
  description: string
  icon?: string
  actionLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'i-mdi:package-variant-closed'
})

defineEmits<{
  action: []
}>()

const iconClasses = computed(() => [
  props.icon,
  'text-gray-400 text-4xl'
].join(' '))
</script>