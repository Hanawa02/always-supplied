<template>
  <div class="text-center py-12">
    <div class="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
      <i :class="iconClasses"></i>
    </div>
    <h3 class="text-lg font-medium text-foreground mb-2">{{ title }}</h3>
    <p class="text-muted-foreground mb-6">{{ description }}</p>
    <slot name="actions">
      <Button v-if="actionLabel" @click="$emit('action')">
        {{ actionLabel }}
      </Button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { Button } from "~/components/ui/button"

interface Props {
  title: string
  description: string
  icon?: string
  actionLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: "i-mdi:package-variant-closed",
})

defineEmits<{
  action: []
}>()

const iconClasses = computed(() => [props.icon, "text-muted-foreground text-4xl"].join(" "))
</script>
