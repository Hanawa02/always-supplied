<template>
  <div class="mb-4">Stock Config View</div>

  <div
    :class="{
      'mb-12': mode === 'controls',
      'mb-28': mode === 'addItem',
      'mb-16': mode === 'addArea',
    }"
  >
    <div v-for="area of stockConfig.areas" :key="area">
      <h2 class="font-semibold border-b mb-2 border-gray-400 text-primary-900">{{ area }}</h2>
      <ul class="grid grid-cols-3 gap-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 mb-6">
        <li v-for="item of itemsPerArea[area]" :key="item.name">
          <ShoppingListItem
            class="w-full"
            :id="item.name"
            :name="item.name"
            :quantity="item.quantity"
            @clicked="handleClicked"
          />
        </li>
      </ul>
    </div>

    <div
      :class="[
        'fixed bottom-0 left-0 right-0 px-4 pb-2 bg-white shadow-[inset_0_1px_4px_rgb(0_0_0_/_0.1)]',
        mode === 'controls' ? 'pt-4' : 'pt-8',
      ]"
    >
      <div class="relative">
        <MdiIcon
          v-if="mode !== 'controls'"
          tag="button"
          type="button"
          icon="close"
          class="absolute -top-8 -right-4 p-2 text-gray-500"
          size="lg"
          @click="setMode('controls')"
        />
      </div>
      <div v-if="mode === 'controls'" class="flex gap-4">
        <BaseButton class="w-full" variant="outline" @click="setMode('addArea')"
          >Add Area</BaseButton
        >
        <BaseButton class="w-full" @click="setMode('addItem')">Add Item</BaseButton>
      </div>
      <StockConfigAddItemForm v-if="mode === 'addItem'" />
      <StockConfigAddAreaForm v-if="mode === 'addArea'"></StockConfigAddAreaForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import ShoppingListItem from "~/components/base/ListItem.vue"
import StockConfigAddItemForm from "~/components/stock-config/StockConfigAddItemForm.vue"
import StockConfigAddAreaForm from "~/components/stock-config/StockConfigAddAreaForm.vue"
import BaseButton from "~/components/base/BaseButton.vue"
import MdiIcon from "../base/MdiIcon.vue"

type Mode = "controls" | "addItem" | "addArea"
const mode = ref<Mode>("controls")

type Item = { id: string; name: string; area: string; quantity: number }
const stockConfig = {
  areas: ["Kitchen", "Bathroom"],
  items: [
    {
      id: "1",
      name: "Toilet Paper",
      quantity: 2,
      area: "Bathroom",
    },
    {
      id: "2",
      name: "Body soap",
      quantity: 3,
      area: "Bathroom",
    },
    {
      id: "3",
      name: "Potatoes",
      quantity: 6,
      area: "Kitchen",
    },

    {
      id: "4",
      quantity: 1,
      name: "Pizza Salami",
      area: "Kitchen",
    },
    { id: "5", name: "Curry Mango Sauce", quantity: 1, area: "Kitchen" },
    { id: "6", name: "Salmon for bread", quantity: 1, area: "Kitchen" },
    { id: "7", name: "Joghurt Monte", quantity: 4, area: "Kitchen" },
    { id: "8", name: "Ketchup", quantity: 1, area: "Kitchen" },
    { id: "9", name: "Chicken Fillets", quantity: 2, area: "Kitchen" },
    { id: "10", name: "Potatoes", quantity: 6, area: "Kitchen" },
    { id: "11", name: "Strawberry", quantity: 7, area: "Kitchen" },
    { id: "12", name: "Cola", quantity: 8, area: "Kitchen" },
    { id: "13", name: "Water", quantity: 9, area: "Kitchen" },
    { id: "14", name: "Strawberry", quantity: 7, area: "Kitchen" },
    { id: "15", name: "Cola", quantity: 8, area: "Kitchen" },
    { id: "16", name: "Water", quantity: 9, area: "Kitchen" },
    { id: "17", name: "Strawberry", quantity: 7, area: "Kitchen" },
    { id: "18", name: "Cola", quantity: 8, area: "Kitchen" },
    { id: "19", name: "Water", quantity: 9, area: "Kitchen" },
    { id: "20", name: "Cola", quantity: 8, area: "Kitchen" },
    { id: "21", name: "Water", quantity: 9, area: "Kitchen" },
    { id: "22", name: "Strawberry", quantity: 7, area: "Kitchen" },
    { id: "23", name: "Cola", quantity: 8, area: "Kitchen" },
    { id: "24", name: "Water", quantity: 9, area: "Kitchen" },
  ],
}

const itemsPerArea = computed(() => {
  const result: Record<string, Item[]> = {}

  for (const item of stockConfig.items) {
    if (result[item.area] == null) {
      result[item.area] = []
    }

    result[item.area]?.push(item)
  }

  return result
})

const handleClicked = (id: string) => {
  console.info("Item clicked:", id)
}

const setMode = (newMode: Mode) => {
  mode.value = newMode
}
</script>
