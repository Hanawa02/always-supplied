<template>
  <button :type="type" :disabled="disabled" :class="buttonClasses" @click="$emit('click', $event)">
    <i v-if="icon && iconPosition === 'left'" :class="iconClasses" />
    <slot />
    <i v-if="icon && iconPosition === 'right'" :class="iconClasses" />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue"

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

const baseClasses =
  "inline-flex items-center justify-center font-medium rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

const variantClasses = computed(() => {
  const variants = {
    primary: "bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500",
    secondary:
      "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-primary-500",
    danger: "bg-danger-500 hover:bg-danger-600 text-white focus:ring-danger-500",
    ghost: "text-gray-600 hover:text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }
  return sizes[props.size]
})

const buttonClasses = computed(() =>
  [
    baseClasses,
    variantClasses.value,
    sizeClasses.value,
    props.fullWidth ? "w-full" : "",
    props.disabled ? "disabled:bg-gray-100 disabled:text-gray-400" : "",
  ]
    .filter(Boolean)
    .join(" "),
)

const iconClasses = computed(() => {
  const spacingClasses = {
    sm: props.iconPosition === "left" ? "mr-1.5" : "ml-1.5",
    md: props.iconPosition === "left" ? "mr-2" : "ml-2",
    lg: props.iconPosition === "left" ? "mr-2.5" : "ml-2.5",
  }

  return [props.icon, "text-lg", spacingClasses[props.size]].join(" ")
})
</script>
