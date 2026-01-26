<template>
  <form @submit="onSubmit" class="flex flex-col gap-2">
    <div class="flex gap-2 items-center">
      <UiInput
        v-model="itemName"
        v-bind="itemNameProps"
        id="itemName"
        :placeholder="common_shopping_item_name_placeholder()"
        class="border rounded p-2 w-full"
        :class="{ 'border-red-500': errors.itemName }"
      />
      <UiInput
        v-model="quantity"
        v-bind="quantityProps"
        id="quantity"
        type="number"
        class="border rounded p-2 w-12 text-center flex-shrink-0"
        :class="{ 'border-red-500': errors.quantity }"
      />
    </div>
    <div class="flex gap-2 items-center">
      <UiInput
        v-model="area"
        v-bind="areaProps"
        id="area"
        :placeholder="common_area_name_placeholder()"
        class="border rounded p-2 w-full"
        :class="{ 'border-red-500': errors.area }"
      />
      <div class="w-12 px-2 flex items-center justify-center">
        <MdiIcon
          type="submit"
          tag="button"
          icon="plus"
          size="xl"
          class="flex-shrink-0 bg-primary-300 text-white rounded-full h-fit p-1 lg:hover:bg-blue-700 transition"
        />
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm, type InvalidSubmissionHandler } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import * as z from "zod"
import MdiIcon from "~/components/base/MdiIcon.vue"
import { UiInput } from "~/components/ui"
import { common_area_name_placeholder, common_shopping_item_name_placeholder } from "~translations"

type FormValues = {
  itemName: string
  quantity: number
  area: string
}

// 1. Define your schema with Zod
const schema = toTypedSchema(
  z.object({
    itemName: z.string().min(1, "Item name is required").max(50, "Name too long"),
    area: z.string(),
    quantity: z.coerce
      .number({ message: "Must be a number" })
      .min(1, "Quantity must be at least 1")
      .max(999, "Cannot exceed 999 units"),
  }),
)

// 2. Initialize the form
const { handleSubmit, errors, defineField, resetForm } = useForm<FormValues>({
  validationSchema: schema,
  initialValues: {
    itemName: "",
    quantity: 1,
    area: "",
  },
})

// 3. Define your field models and attributes
// These provide two-way binding and validation triggers
const [itemName, itemNameProps] = defineField("itemName")
const [quantity, quantityProps] = defineField("quantity")
const [area, areaProps] = defineField("area")

// 4. Success Handler
const onFinish = (values: FormValues) => {
  // toast.success('Item added successfully!')
  console.log(values)
  resetForm()
}

// 5. Invalid Handler (This triggers the toasts)
const onInvalid: InvalidSubmissionHandler<FormValues, FormValues> = ({ errors }) => {
  // Option A: Single toast for the first error found
  // const firstError = Object.values(errors)[0]
  console.error(errors)
  // toast.error(`Form Error: ${firstError}`)
  // Option B: Loop through and show all errors
  // Object.values(errors).forEach(msg => toast.error(msg))
}

// 6. Wrap it in handleSubmit
const onSubmit = handleSubmit(onFinish, onInvalid)
// InvalidSubmissionContext<TInput, TOutput></TInput>
</script>
