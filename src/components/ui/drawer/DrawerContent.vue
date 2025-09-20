<script lang="ts" setup>
import { reactiveOmit } from "@vueuse/core"
import type { DialogContentEmits, DialogContentProps } from "reka-ui"
import { useForwardPropsEmits } from "reka-ui"
import { DrawerContent, DrawerPortal } from "vaul-vue"
import { computed, type HTMLAttributes } from "vue"

import { cn } from "~/lib/utils"

import DrawerOverlay from "./DrawerOverlay.vue"

const props = defineProps<
  DialogContentProps & {
    class?: HTMLAttributes["class"]
    position: "bottom" | "left" | "top" | "right"
  }
>()
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, "class")
const forwardedProps = useForwardPropsEmits(delegatedProps, emits)

const POSITION_CLASSES = {
  bottom:
    "fixed inset-x-0 bottom-0 z-[99] mt-24 flex h-auto flex-col rounded-t-2 border bg-background",
  top: "fixed inset-x-0 top-0 z-[99] mb-24 flex h-auto flex-col rounded-b-2 border bg-background",
  left: "fixed inset-y-0 left-0 z-[99] mr-24 flex w-auto flex-col rounded-r-2 border bg-background",
  right:
    "fixed inset-y-0 right-0 z-[99] ml-24 flex h-auto flex-col rounded-l-2 border bg-background",
}

const contentCLasses = computed(() => POSITION_CLASSES[props.position])
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerContent v-bind="forwardedProps" :class="cn(contentCLasses, props.class)">
      <slot />
    </DrawerContent>
  </DrawerPortal>
</template>
