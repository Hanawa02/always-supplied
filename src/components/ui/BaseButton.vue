<template>
  <Button
    :variant="shadcnVariant"
    :size="shadcnSize"
    :type="type"
    :disabled="disabled"
    :class="fullWidth ? 'w-full' : ''"
    @click="$emit('click', $event)"
  >
    <i v-if="icon && iconPosition === 'left'" :class="iconClasses" />
    <slot />
    <i v-if="icon && iconPosition === 'right'" :class="iconClasses" />
  </Button>
</template>

<script setup lang="ts">
import { computed } from "vue"

import type { ButtonVariants } from "~/components/ui/button"
import { Button } from "~/components/ui/button"

interface Props {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  icon?: string
  iconPosition?: "left" | "right"
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  type: "button",
  disabled: false,
  iconPosition: "left",
  fullWidth: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()

// Map our custom variants to shadcn variants
const shadcnVariant = computed((): ButtonVariants["variant"] => {
  const variantMap = {
    primary: "default" as const,
    secondary: "outline" as const,
    danger: "destructive" as const,
    ghost: "ghost" as const,
  }
  return variantMap[props.variant]
})

// Map our custom sizes to shadcn sizes
const shadcnSize = computed((): ButtonVariants["size"] => {
  const sizeMap = {
    sm: "sm" as const,
    md: "default" as const,
    lg: "lg" as const,
  }
  return sizeMap[props.size]
})

const iconClasses = computed(() => {
  const spacingClasses = {
    sm: props.iconPosition === "left" ? "mr-1.5" : "ml-1.5",
    md: props.iconPosition === "left" ? "mr-2" : "ml-2",
    lg: props.iconPosition === "left" ? "mr-2.5" : "ml-2.5",
  }

  return [props.icon, "text-lg", spacingClasses[props.size]].join(" ")
})
</script>
