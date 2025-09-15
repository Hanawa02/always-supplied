<template>
  <div v-if="shouldShow">
    <slot v-if="hasAccess" />
    <div v-else-if="showFallback">
      <slot name="fallback">
        <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div class="flex">
            <i class="i-mdi:lock w-5 h-5 text-yellow-400 mt-0.5 mr-3"></i>
            <div>
              <h3 class="text-sm font-medium text-yellow-800">
                {{ fallbackTitle || 'Access Restricted' }}
              </h3>
              <p class="mt-1 text-sm text-yellow-700">
                {{ fallbackMessage || 'You do not have permission to access this content.' }}
              </p>
            </div>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { usePermissions, type Permission } from '~/composables/usePermissions'

interface Props {
  buildingId: string
  permission: Permission | Permission[]
  requireAll?: boolean // If true, all permissions are required; if false, any permission is sufficient
  showFallback?: boolean // Whether to show fallback content when access is denied
  fallbackTitle?: string
  fallbackMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  requireAll: false,
  showFallback: true
})

const { hasPermission, hasPermissions } = usePermissions()

const hasAccess = ref(false)
const isLoading = ref(true)

const permissions = computed(() => {
  return Array.isArray(props.permission) ? props.permission : [props.permission]
})

const shouldShow = computed(() => {
  // Always show content when not authenticated (local mode)
  // or when we have access or when we want to show fallback
  return !isLoading.value && (hasAccess.value || props.showFallback)
})

const checkPermissions = async () => {
  if (!props.buildingId) {
    hasAccess.value = false
    isLoading.value = false
    return
  }

  isLoading.value = true

  try {
    if (permissions.value.length === 1) {
      hasAccess.value = await hasPermission(props.buildingId, permissions.value[0])
    } else {
      const results = await hasPermissions(props.buildingId, permissions.value)

      if (props.requireAll) {
        hasAccess.value = results.every(result => result)
      } else {
        hasAccess.value = results.some(result => result)
      }
    }
  } catch (error) {
    console.error('Permission check failed:', error)
    hasAccess.value = false
  } finally {
    isLoading.value = false
  }
}

// Watch for changes and recheck permissions
watch(() => [props.buildingId, props.permission], checkPermissions, { immediate: true })

onMounted(() => {
  checkPermissions()
})
</script>