<template>
  <Badge
    :variant="badgeVariant"
    :class="badgeClass"
  >
    <i v-if="roleIcon" :class="roleIcon" class="w-3 h-3 mr-1"></i>
    {{ roleLabel }}
  </Badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { Badge, type BadgeVariants } from '~/components/ui/badge'
import { type Role,usePermissions } from '~/composables/usePermissions'

interface Props {
  role: Role
  showIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showIcon: true
})

const { getRoleInfo } = usePermissions()

const roleInfo = computed(() => {
  return props.role ? getRoleInfo(props.role) : null
})

const roleLabel = computed(() => {
  return roleInfo.value?.label || 'Unknown'
})

const roleIcon = computed(() => {
  if (!props.showIcon || !props.role) return null

  const iconMap = {
    owner: 'i-mdi:crown',
    member: 'i-mdi:account',
    viewer: 'i-mdi:eye'
  }

  return iconMap[props.role] || null
})

const badgeVariant = computed<BadgeVariants['variant']>(() => {
  if (!roleInfo.value) return 'secondary'

  const variantMap: Record<string, BadgeVariants['variant']> = {
    blue: 'default',
    green: 'default',
    gray: 'secondary'
  }

  return variantMap[roleInfo.value.color] || 'secondary'
})

const badgeClass = computed(() => {
  if (!roleInfo.value) return ''

  const classMap = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return classMap[roleInfo.value.color as keyof typeof classMap] || ''
})
</script>