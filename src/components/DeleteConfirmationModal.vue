<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-full items-center justify-center p-4 text-center">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="emit('cancel')"
      ></div>

      <!-- Modal panel -->
      <div
        class="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all"
      >
        <!-- Icon -->
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-100 mb-4"
        >
          <i class="i-mdi:alert-outline text-danger-600 text-xl"></i>
        </div>

        <!-- Content -->
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ m.delete_confirmation.title() }}
          </h3>
          <p class="text-sm text-gray-600 mb-6">
            {{ m.delete_confirmation.message({ itemName }) }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex space-x-3">
          <BaseButton
            variant="secondary"
            full-width
            @click="emit('cancel')"
          >
            {{ m.delete_confirmation.cancel() }}
          </BaseButton>
          <BaseButton
            variant="danger"
            full-width
            @click="emit('confirm')"
          >
            {{ m.delete_confirmation.delete() }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from "~/components/ui/BaseButton.vue"
import { useI18n } from "~/composables/useI18n"

interface Props {
  itemName: string
}

defineProps<Props>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const { m } = useI18n()
</script>
