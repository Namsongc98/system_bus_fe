<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  ariaLabel: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  onLabel: { type: String, default: 'Yes' },
  offLabel: { type: String, default: 'No' },
})

const emit = defineEmits(['update:modelValue', 'change'])

function handleChange(event) {
  if (props.disabled) return

  const nextValue = event.target.checked
  emit('update:modelValue', nextValue)
  emit('change', nextValue)
}
</script>

<template>
  <label
    class="relative inline-flex items-center"
    :class="disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'"
  >
    <input
      class="peer sr-only"
      type="checkbox"
      value=""
      :checked="modelValue"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-checked="modelValue"
      role="switch"
      @change="handleChange"
    />
    <span
      class="peer h-8 w-18 rounded-full bg-blue-300 duration-100 outline-none peer-focus:ring-4 peer-focus:ring-blue-500 peer-focus:outline-none after:absolute after:top-0 after:left-0 after:flex after:h-8 after:w-8 after:items-center after:justify-center after:rounded-full after:bg-white after:font-bold after:text-sky-800 after:duration-500 peer-checked:after:translate-x-10 peer-checked:after:border-white"
      :class="
        modelValue ? 'after:content-[attr(data-on-label)]' : 'after:content-[attr(data-off-label)]'
      "
      :data-on-label="onLabel"
      :data-off-label="offLabel"
    ></span>
  </label>
</template>
