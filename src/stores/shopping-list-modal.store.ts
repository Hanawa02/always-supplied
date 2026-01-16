import { ref } from "vue"
import { defineStore } from "pinia"
import type { ShoppingItem } from "~/types/shopping-item"

export const useShoppingListModalStore = defineStore("ShoppingListModal", () => {
  const show = ref(false)
  const shoppingItem = ref<ShoppingItem | null>(null)

  function open(item: ShoppingItem) {
    show.value = true
    shoppingItem.value = { ...item }
  }

  function close() {
    show.value = false
    shoppingItem.value = null
  }

  return { show, shoppingItem, open, close }
})
