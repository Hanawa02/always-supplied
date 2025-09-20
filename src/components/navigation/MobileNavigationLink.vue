<template>
  <router-link
    v-bind="props"
    :class="clsx(buttonVariants({ variant: 'ghost' }), 'w-full text-left justify-start! px-4 py-2')"
  >
    <slot />
  </router-link>
</template>

<script setup lang="ts">
import clsx from "clsx"
import { type RouterLinkProps } from "vue-router"

import { buttonVariants } from "~/components/ui/button"

const props = defineProps<RouterLinkProps>()
</script>
