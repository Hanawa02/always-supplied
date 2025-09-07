<template>
  <Card class="p-4">
    <div class="flex items-center">
      <div class="flex-1">
        <p class="text-sm font-medium text-muted-foreground">{{ title }}</p>
        <p class="text-2xl font-bold text-foreground">{{ value }}</p>
        <p v-if="subtitle" class="text-xs text-muted-foreground mt-1">{{ subtitle }}</p>
      </div>
      <div v-if="icon" class="ml-4">
        <div :class="iconWrapperClasses">
          <i :class="iconClasses"></i>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { Card } from "~/components/ui/card"

interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  iconColor?: "primary" | "success" | "warning" | "danger" | "info"
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: "primary",
})

const iconWrapperClasses = computed(() => {
  const colorClasses = {
    primary: "bg-primary-100",
    success: "bg-success-100",
    warning: "bg-warning-100",
    danger: "bg-danger-100",
    info: "bg-info-100",
  }

  return [
    "w-8 h-8 rounded-lg flex items-center justify-center",
    colorClasses[props.iconColor],
  ].join(" ")
})

const iconClasses = computed(() => {
  const colorClasses = {
    primary: "text-primary-600",
    success: "text-success-600",
    warning: "text-warning-600",
    danger: "text-danger-600",
    info: "text-info-600",
  }

  return [props.icon, colorClasses[props.iconColor]].join(" ")
})
</script>
