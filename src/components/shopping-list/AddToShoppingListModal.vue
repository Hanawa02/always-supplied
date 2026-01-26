<template>
  <BaseModal :show="show" @closed="store.close">
    <h2 class="font-bold text-lg text-center mb-4">{{ add_to_shopping_list_modal_title() }}</h2>
    <div v-if="shoppingItem" class="flex gap-2">
      <UiInput
        v-model="shoppingItem.name"
        id="itemName"
        :placeholder="common_shopping_item_name_placeholder()"
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
        <BaseButton class="w-full" variant="outline" @click="store.close">{{
          common_cancel()
        }}</BaseButton>
        <BaseButton class="w-full" @click="onAdd">{{ common_add() }}</BaseButton>
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
import {
  common_add,
  common_cancel,
  add_to_shopping_list_modal_title,
  common_shopping_item_name_placeholder,
} from "~translations"

const store = useShoppingListModalStore()

const { show, shoppingItem } = storeToRefs(store)

const onAdd = () => {
  // toast.success('Item added successfully!')
  console.log(shoppingItem.value)
  // TODO: Add to shopping list
  store.close()
}
</script>
