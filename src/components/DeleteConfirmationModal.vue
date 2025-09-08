<template>
  <AlertDialog :open="true">
    <AlertDialogContent class="max-w-md">
      <AlertDialogHeader>
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
          <i class="i-mdi:alert-outline text-red-600 text-xl"></i>
        </div>
        <AlertDialogTitle class="text-center">
          {{ m.delete_confirmation.title() }}
        </AlertDialogTitle>
        <AlertDialogDescription class="text-center">
          {{ m.delete_confirmation.message({ itemName }) }}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel @click="emit('cancel')">
          {{ m.delete_confirmation.cancel() }}
        </AlertDialogCancel>
        <AlertDialogAction @click="emit('confirm')" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
          {{ m.delete_confirmation.delete() }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
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
