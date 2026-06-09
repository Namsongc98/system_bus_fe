<script setup>
import BaseEmptyState from '@/components/elements/BaseEmptyState.vue'

/**
 * BaseDataTable — stateless reusable table with slot-based cells.
 *
 * @typedef {{ key: string, label: string }} TableColumn
 */
const props = defineProps({
  columns: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
  rowKey: { type: [String, Function], default: 'id' },
  loading: { type: Boolean, default: false },
  emptyTitle: { type: String, default: 'No records found' },
  emptyDescription: { type: String, default: '' },
  selectedKey: { type: [String, Number], default: null },
})

const emit = defineEmits(['row-click'])

function getRowKey(row) {
  if (typeof props.rowKey === 'function') return props.rowKey(row)
  return row?.[props.rowKey]
}

function isSelected(row) {
  return String(getRowKey(row)) === String(props.selectedKey)
}
</script>

<template>
  <div>
    <div v-if="loading" class="p-8 text-center text-sm font-semibold text-slate-500">
      Loading...
    </div>

    <div v-else-if="!rows.length" class="p-8">
      <BaseEmptyState :title="emptyTitle" :description="emptyDescription" />
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <tr
            v-for="row in rows"
            :key="getRowKey(row)"
            class="cursor-pointer transition hover:bg-sky-50"
            :class="{ 'bg-sky-50': isSelected(row) }"
            @click="emit('row-click', row)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-5 py-4 text-sm text-slate-600"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :column="column"
                :value="row[column.key]"
              >
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
