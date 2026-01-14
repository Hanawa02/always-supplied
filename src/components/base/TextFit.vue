<template>
  <div
    lang="de"
    class="flex justify-center items-center w-full h-full text-center break-words hyphens-auto aline-clamp-3"
    ref="container"
    :style="`font-size: calc(1em * var(--dynamic-factor, 1)); --dynamic-factor: ${dynamicFactor}`"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useResizeObserver } from "@vueuse/core"
import { onMounted, onUpdated, ref, useTemplateRef } from "vue"

const container = useTemplateRef("container")
const currentWidth = ref(0)

const dynamicFactor = ref(1)

onMounted(() => {
  updateFontSize()
})

onUpdated(() => {
  updateFontSize()
})
useResizeObserver(container, (entries) => {
  const entry = entries[0]
  if (!entry) {
    return
  }

  const { width } = entry?.contentRect

  const updateMode = currentWidth.value < width ? "increasing" : "decreasing"
  updateFontSize(updateMode)
})

function updateFontSize(updateMode: "increasing" | "decreasing" = "decreasing") {
  const target = container.value as HTMLDivElement

  if (target == null) return

  const scrollHeight = target?.scrollHeight
  const scrollWidth = target?.scrollWidth

  const maxHeight = target?.clientHeight
  const maxWidth = target?.clientWidth

  if (scrollHeight > maxHeight || scrollWidth > maxWidth) {
    dynamicFactor.value = dynamicFactor.value - 0.05
  } else if (updateMode === "increasing") {
    dynamicFactor.value = dynamicFactor.value + 0.05
  }
}
</script>
