<template>
  <div class="mb-4">Shopping List View</div>

  <ul class="grid grid-cols-3 gap-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 mb-12">
    <li v-for="item of fakeList" :key="item.name">
      <ShoppingListItem
        class="w-full"
        :id="item.name"
        :name="item.name"
        :quantity="item.quantity"
        @clicked="handleClicked"
      />
    </li>
  </ul>

  <div
    class="fixed bottom-0 left-0 right-0 px-4 pb-2 pt-4 bg-white shadow-[inset_0_1px_4px_rgb(0_0_0_/_0.1)]"
  >
    <ShoppingListAddForm />
  </div>
</template>

<script setup lang="ts">
import ShoppingListAddForm from "~/components/shopping-list/ShoppingListAddForm.vue"
import ShoppingListItem from "~/components/base/ListItem.vue"

const fakeList = [
  { name: "Curry Mango Sauce", quantity: 1 },
  { name: "Salmon for bread", quantity: 1 },
  { name: "Joghurt Monte", quantity: 4 },
  { name: "Ketchup", quantity: 1 },
  { name: "Chicken Fillets", quantity: 2 },
  { name: "Potatoes", quantity: 6 },
  { name: "Strawberry", quantity: 7 },
  { name: "Cola", quantity: 8 },
  { name: "Water", quantity: 9 },
]

const handleClicked = (id: string) => {
  console.info("Item clicked:", id)
}
</script>
