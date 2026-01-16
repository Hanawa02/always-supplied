<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="show"
        class="fixed inset-0 w-screen h-screen bg-black/75 flex items-center justify-center z-[1000]"
        @click.self="handleClose"
      >
        <div class="relative flex flex-col gap-4 bg-white p-4 rounded max-w-[90%] min-w-[12rem]">
          <button @click="handleClose" class="absolute top-2 right-2">
            <MdiIcon icon="close" class="w-6 h-6" />
          </button>
          <header v-if="$slots.header">
            <slot name="header"></slot>
          </header>

          <main>
            <slot></slot>
          </main>

          <footer v-if="$slots.footer">
            <slot name="footer"> </slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onUnmounted, watchEffect } from "vue"
import MdiIcon from "./MdiIcon.vue"

interface IProps {
  show: boolean
}
const props = defineProps<IProps>()

const emit = defineEmits<{
  (e: "closed"): void
}>()

const handleClose = () => {
  emit("closed")
}

// Handle Escape key to close
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.show) {
    handleClose()
  }
}

// Manage body scroll and event listeners
watchEffect(() => {
  if (props.show) {
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeydown)
  } else {
    document.body.style.overflow = ""
    window.removeEventListener("keydown", handleKeydown)
  }
})

onUnmounted(() => {
  document.body.style.overflow = ""
  window.removeEventListener("keydown", handleKeydown)
})
</script>

<style scoped>
/* Vue Transition Classes */
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
</style>
