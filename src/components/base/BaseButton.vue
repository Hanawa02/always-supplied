<template>
  <button :type="type" :class="buttonVariants({ variant, size })">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { cva } from "~/utils/cva"
import type { VariantProps } from "~/utils/cva"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white lg:hover:bg-primary-700",
        outline: "bg-white border border-primary-300 text-primary-800 lg:hover:bg-primary-200",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

type ButtonVariants = VariantProps<typeof buttonVariants>

type IProps = {
  type?: HTMLButtonElement["type"]
  variant?: ButtonVariants["variant"]
  size?: ButtonVariants["size"]
}

withDefaults(defineProps<IProps>(), { type: "button", variant: "default", size: "default" })
</script>
