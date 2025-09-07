<template>
  <div class="inline-flex items-center">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      :class="logoClass"
      role="img"
      :aria-label="ariaLabel"
    >
      <!-- Main container/box shape -->
      <rect
        x="6"
        y="10"
        width="36"
        height="28"
        rx="6"
        :fill="variant === 'mono' ? 'currentColor' : colors.primary"
        :fill-opacity="variant === 'mono' ? '0.1' : '0.9'"
        :stroke="variant === 'mono' ? 'currentColor' : colors.primaryDark"
        stroke-width="1.5"
      />

      <!-- Supply items/shelves inside -->
      <rect
        x="10"
        y="16"
        width="28"
        height="2"
        rx="1"
        :fill="variant === 'mono' ? 'currentColor' : colors.primaryDark"
        :fill-opacity="variant === 'mono' ? '0.6' : '1'"
      />
      <rect
        x="10"
        y="22"
        width="28"
        height="2"
        rx="1"
        :fill="variant === 'mono' ? 'currentColor' : colors.primaryDark"
        :fill-opacity="variant === 'mono' ? '0.6' : '1'"
      />
      <rect
        x="10"
        y="28"
        width="28"
        height="2"
        rx="1"
        :fill="variant === 'mono' ? 'currentColor' : colors.primaryDark"
        :fill-opacity="variant === 'mono' ? '0.6' : '1'"
      />

      <!-- Supply items on shelves -->
      <circle
        cx="14"
        cy="14"
        r="1.5"
        :fill="variant === 'mono' ? 'currentColor' : colors.accent"
        :fill-opacity="variant === 'mono' ? '0.8' : '1'"
      />
      <circle
        cx="20"
        cy="14"
        r="1.5"
        :fill="variant === 'mono' ? 'currentColor' : colors.accent"
        :fill-opacity="variant === 'mono' ? '0.8' : '1'"
      />
      <circle
        cx="26"
        cy="14"
        r="1.5"
        :fill="variant === 'mono' ? 'currentColor' : colors.accent"
        :fill-opacity="variant === 'mono' ? '0.8' : '1'"
      />

      <rect
        x="13"
        y="19.5"
        width="3"
        height="3"
        rx="0.5"
        :fill="variant === 'mono' ? 'currentColor' : colors.accent"
        :fill-opacity="variant === 'mono' ? '0.8' : '1'"
      />
      <rect
        x="18"
        y="19.5"
        width="3"
        height="3"
        rx="0.5"
        :fill="variant === 'mono' ? 'currentColor' : colors.accent"
        :fill-opacity="variant === 'mono' ? '0.8' : '1'"
      />
      <rect
        x="23"
        y="19.5"
        width="3"
        height="3"
        rx="0.5"
        :fill="variant === 'mono' ? 'currentColor' : colors.accent"
        :fill-opacity="variant === 'mono' ? '0.8' : '1'"
      />

      <ellipse
        cx="15"
        cy="26"
        rx="2"
        ry="1"
        :fill="variant === 'mono' ? 'currentColor' : colors.accent"
        :fill-opacity="variant === 'mono' ? '0.8' : '1'"
      />
      <ellipse
        cx="22"
        cy="26"
        rx="2"
        ry="1"
        :fill="variant === 'mono' ? 'currentColor' : colors.accent"
        :fill-opacity="variant === 'mono' ? '0.8' : '1'"
      />
      <ellipse
        cx="29"
        cy="26"
        rx="2"
        ry="1"
        :fill="variant === 'mono' ? 'currentColor' : colors.accent"
        :fill-opacity="variant === 'mono' ? '0.8' : '1'"
      />

      <!-- Checkmark indicator (always supplied) -->
      <circle
        cx="38"
        cy="16"
        r="6"
        :fill="variant === 'mono' ? 'currentColor' : colors.success"
        :fill-opacity="variant === 'mono' ? '0.9' : '1'"
      />
      <path
        d="M35 16l2 2 4-4"
        :stroke="variant === 'mono' ? 'white' : 'white'"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

interface Props {
  size?: number | string
  variant?: "default" | "mono"
  class?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 48,
  variant: "default",
  class: "",
  ariaLabel: "Always Supplied logo",
})

// Color values from the design system
const colors = {
  primary: "#10b981", // primary-500
  primaryDark: "#047857", // primary-700
  accent: "#f59e0b", // accent-500
  success: "#22c55e", // success-500
}

const logoClass = computed(() => props.class)
</script>
