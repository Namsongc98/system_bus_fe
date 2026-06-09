<script setup>
import BaseButton from '@/components/elements/BaseButton.vue'

defineProps({
  rows: { type: Array, default: () => [] },
})

function statusClass(status) {
  return status === 'maintenance'
    ? 'bg-stone-200 text-gray-700'
    : 'bg-emerald-800/10 text-emerald-800'
}
</script>

<template>
  <section
    class="overflow-hidden rounded-2xl bg-white shadow-[0px_12px_64px_0px_rgba(27,27,28,0.04)]"
  >
    <header class="flex items-center justify-between border-b border-zinc-100 p-6">
      <h2 class="text-base leading-6 font-bold text-zinc-900">Revenue by Bus Unit</h2>
      <BaseButton
        unstyled
        html-type="button"
        class="text-xs leading-4 font-bold text-sky-500 hover:text-sky-700"
      >
        View All Units
      </BaseButton>
    </header>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[680px] text-left">
        <thead class="bg-stone-100">
          <tr>
            <th class="px-6 py-5 text-[10px] font-bold tracking-wide text-gray-700 uppercase">
              Bus ID
            </th>
            <th class="px-6 py-5 text-[10px] font-bold tracking-wide text-gray-700 uppercase">
              Operator
            </th>
            <th class="px-6 py-4 text-[10px] font-bold tracking-wide text-gray-700 uppercase">
              Total<br />Earnings
            </th>
            <th class="px-6 py-5 text-[10px] font-bold tracking-wide text-gray-700 uppercase">
              Trips
            </th>
            <th class="px-6 py-5 text-[10px] font-bold tracking-wide text-gray-700 uppercase">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.id"
            class="border-t border-slate-300/10 first:border-t-0"
          >
            <td class="px-6 py-4 text-sm leading-5 font-bold text-sky-700">{{ row.busId }}</td>
            <td class="px-6 py-4 text-sm leading-5 text-zinc-900">{{ row.operator }}</td>
            <td class="px-6 py-4 text-sm leading-5 text-zinc-900">{{ row.earnings }}</td>
            <td class="px-6 py-4 text-sm leading-5 text-zinc-900">{{ row.trips }}</td>
            <td class="px-6 py-4">
              <span
                class="inline-flex rounded-full px-2.5 text-[10px] leading-5 font-bold uppercase"
                :class="statusClass(row.status)"
              >
                {{ row.statusLabel }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
