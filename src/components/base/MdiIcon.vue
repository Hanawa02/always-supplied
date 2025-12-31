<template>
  <component :is="tag" class="flex-inline w-fit items-center">
    <div
      :class="['icon-base', sizeClass]"
      :style="{ '--un-icon': `url('https://api.iconify.design/mdi:${icon}.svg')` }"
    ></div>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue"

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl"

const SIZE_CLASSES: Record<Size, string> = {
  xs: "h-2 w-2",
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
  "2xl": "h-8 w-8",
}
interface IProps {
  icon: string
  tag?: keyof HTMLElementTagNameMap
  size?: Size
}
const props = withDefaults(defineProps<IProps>(), { size: "md", tag: "div" })

const sizeClass = computed(() => SIZE_CLASSES[props.size])
</script>

<style scoped>
.icon-base {
  display: inline-block;
  background-color: currentColor;
  mask: var(--un-icon) no-repeat;
  mask-size: 100% 100%;
  -webkit-mask: var(--un-icon) no-repeat;
  -webkit-mask-size: 100% 100%;
}
</style>
