<template>
  <!-- TODO: add event on touch, long press, double click -->
  <button
    type="button"
    @click="onButtonClick"
    @touchend="onButtonTouch"
    :class="[
      'flex items-center aspect-6/4 relative bg-primary-200  rounded-md p-3 text-center shadow leading-[1.25]',
      'lg:hover:bg-primary-300 lg:hover:cursor-pointer',
    ]"
  >
    <TextFit>{{ name }}</TextFit>
    <div
      v-if="showQuantity"
      class="absolute top-0.5 right-0.5 text-[0.65rem] bg-white rounded-full w-4 h-4 flex items-center justify-center"
    >
      {{ quantity }}
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue"
import TextFit from "~/components/base/TextFit.vue"

interface IProps {
  id: string
  name: string
  quantity: number
}

const props = defineProps<IProps>()

const showQuantity = computed(() => props.quantity > 1)

const emit = defineEmits<{
  (e: "clicked", item: IProps): void
  (e: "touched", item: IProps): void
}>()

const onButtonClick = () => {
  // TypeScript will error here if you pass a string instead of a number
  emit("clicked", props)
}

const onButtonTouch = () => {
  // TypeScript will error here if you pass a string instead of a number
  emit("touched", props)
}
</script>
