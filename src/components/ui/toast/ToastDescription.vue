<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core"
import type { ToastDescriptionProps } from "reka-ui"
import { ToastDescription } from "reka-ui"
import type { HTMLAttributes } from "vue"

import { cn } from "~/lib/utils"

const props = defineProps<ToastDescriptionProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <ToastDescription :class="cn('text-sm opacity-90', props.class)" v-bind="delegatedProps">
    <slot />
  </ToastDescription>
</template>
