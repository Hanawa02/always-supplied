<template>
  <BaseModal :show="show" @closed="store.close">
    <h2 class="font-bold text-lg text-center mb-4">Add to shopping list</h2>
    <div v-if="shoppingItem" class="flex gap-2">
      <UiInput
        v-model="shoppingItem.name"
        id="itemName"
        placeholder="e.g. Apples"
        class="border rounded p-2 w-full"
      />
      <UiInput
        v-model="shoppingItem.quantity"
        id="quantity"
        type="number"
        class="border rounded p-2 w-12 text-center"
      />
    </div>
    <template #footer>
      <div class="flex gap-4">
        <BaseButton class="w-full" variant="outline" @click="store.close">Cancel</BaseButton>
        <BaseButton class="w-full" @click="onAdd">Add</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { useShoppingListModalStore } from "~/stores/shopping-list-modal.store"
import { storeToRefs } from "pinia"
import BaseModal from "~/components/base/BaseModal.vue"
import UiInput from "../ui/UiInput.vue"
import BaseButton from "~/components/base/BaseButton.vue"

const store = useShoppingListModalStore()

const { show, shoppingItem } = storeToRefs(store)

const onAdd = () => {
  // toast.success('Item added successfully!')
  console.log(shoppingItem.value)
  // TODO: Add to shopping list
  store.close()
}
</script>
