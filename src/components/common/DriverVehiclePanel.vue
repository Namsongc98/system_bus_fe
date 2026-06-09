<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseEmptyState from '@/components/elements/BaseEmptyState.vue'

/**
 * DriverVehiclePanel — composed UI for assigning buses to one selected driver.
 */
const props = defineProps({
  driver: { type: Object, default: null },
  assignedBuses: { type: Array, default: () => [] },
  availableBuses: { type: Array, default: () => [] },
  assignedToOtherBuses: { type: Array, default: () => [] },
  selectedVehicleId: { type: [String, Number], default: '' },
  saving: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:selectedVehicleId', 'assign', 'remove-bus'])

const selectedValue = computed({
  get: () => props.selectedVehicleId,
  set: (value) => emit('update:selectedVehicleId', value),
})
</script>

<template>
  <aside class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <template v-if="driver">
      <div class="border-b border-slate-200 pb-4">
        <p class="text-xs font-bold tracking-wider text-sky-700 uppercase">Selected driver</p>
        <h3 class="mt-1 text-lg font-black text-slate-950">{{ driver.name }}</h3>
        <p class="mt-1 text-sm text-slate-500">{{ driver.contact }}</p>
      </div>

      <div class="mt-5">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-bold text-slate-950">Assigned buses</h4>
          <span class="text-xs font-bold text-slate-500">{{ assignedBuses.length }}</span>
        </div>

        <div v-if="assignedBuses.length" class="mt-3 flex flex-col gap-3">
          <article
            v-for="bus in assignedBuses"
            :key="bus.id"
            class="rounded-lg border border-slate-200 p-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-bold text-slate-950">{{ bus.label }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ bus.meta }}</p>
              </div>
              <BaseButton
                label="Remove"
                type="outline"
                size="sm"
                :loading="saving"
                @click="emit('remove-bus', bus)"
              />
            </div>
          </article>
        </div>

        <BaseEmptyState
          v-else
          class="mt-3"
          title="This driver has no assigned bus."
          tone="warning"
        />
      </div>

      <div class="mt-6">
        <h4 class="text-sm font-bold text-slate-950">Assign or change bus</h4>
        <div class="mt-3 flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
          <label
            v-for="bus in availableBuses"
            :key="bus.id"
            class="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-sky-200 hover:bg-sky-50"
          >
            <input
              v-model="selectedValue"
              type="radio"
              name="vehicle"
              :value="bus.id"
              class="mt-1"
            />
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-bold text-slate-950">{{ bus.label }}</span>
              <span class="mt-1 block text-xs text-slate-500">
                {{ bus.meta }}
                <span v-if="bus.current"> · Current</span>
              </span>
            </span>
          </label>

          <BaseEmptyState
            v-if="!availableBuses.length"
            title="No available buses to assign."
            class="text-left"
          />
        </div>

        <div v-if="assignedToOtherBuses.length" class="mt-4 rounded-lg bg-slate-50 p-3">
          <p class="text-xs font-bold text-slate-500 uppercase">Assigned to other drivers</p>
          <ul class="mt-2 flex flex-col gap-1 text-xs text-slate-500">
            <li v-for="bus in assignedToOtherBuses" :key="bus.id">
              {{ bus.label }} — {{ bus.driverName }}
            </li>
          </ul>
        </div>

        <BaseEmptyState v-if="error" class="mt-3 text-left" :title="error" tone="danger" />

        <BaseButton
          class="mt-4"
          label="Save assignment"
          block
          :loading="saving"
          :disabled="!selectedVehicleId"
          @click="emit('assign')"
        />
      </div>
    </template>

    <div v-else class="py-10">
      <BaseEmptyState
        title="Select a driver"
        description="Driver vehicle details will appear here."
      />
    </div>
  </aside>
</template>
