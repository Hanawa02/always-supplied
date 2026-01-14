<template>
  <form @submit="onSubmit" class="flex items-center gap-2">
    <UiInput
      v-model="area"
      v-bind="areaProps"
      id="area"
      placeholder="e.g. Apples"
      class="border rounded p-2 w-full"
      :class="{ 'border-red-500': errors.area }"
    />

    <MdiIcon
      type="submit"
      tag="button"
      icon="plus"
      size="xl"
      class="flex-shrink-0 bg-primary-300 text-white rounded-full h-fit p-1 lg:hover:bg-blue-700 transition"
    />
  </form>
</template>

<script setup lang="ts">
import { useForm, type InvalidSubmissionHandler } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import * as z from "zod"
import MdiIcon from "~/components/base/MdiIcon.vue"
import { UiInput } from "~/components/ui"

type FormValues = {
  area: string
}

// 1. Define your schema with Zod
const schema = toTypedSchema(
  z.object({
    area: z.string().min(1, "Area name is required").max(50, "Name too long"),
  }),
)

// 2. Initialize the form
const { handleSubmit, errors, defineField, resetForm } = useForm<FormValues>({
  validationSchema: schema,
  initialValues: {
    area: "",
  },
})

// 3. Define your field models and attributes
// These provide two-way binding and validation triggers
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
