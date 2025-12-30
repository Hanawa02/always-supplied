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
import { onMounted, onUpdated, ref, useTemplateRef } from "vue"

const container = useTemplateRef("container")

const dynamicFactor = ref(1)

onMounted(() => {
  updateFontSize()
})

onUpdated(() => {
  updateFontSize()
})

function updateFontSize() {
  const target = container.value as HTMLDivElement

  const scrollHeight = target?.scrollHeight
  const scrollWidth = target?.scrollWidth

  const maxHeight = target.clientHeight
  const maxWidth = target.clientWidth

  if (target && (scrollHeight > maxHeight || scrollWidth > maxWidth)) {
    dynamicFactor.value = dynamicFactor.value - 0.05
  }
}
</script>
