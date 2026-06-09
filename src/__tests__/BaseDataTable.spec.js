import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import BaseDataTable from '@/components/elements/BaseDataTable.vue'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
]

const rows = [
  { id: 1, name: 'Driver A', status: 'Assigned' },
  { id: 2, name: 'Driver B', status: 'Needs bus' },
]

describe('BaseDataTable', () => {
  it('renders columns and rows', () => {
    const wrapper = mount(BaseDataTable, {
      props: { columns, rows },
    })

    expect(wrapper.text()).toContain('Name')
    expect(wrapper.text()).toContain('Status')
    expect(wrapper.text()).toContain('Driver A')
    expect(wrapper.text()).toContain('Needs bus')
  })

  it('renders a loading state', () => {
    const wrapper = mount(BaseDataTable, {
      props: { columns, rows: [], loading: true },
    })

    expect(wrapper.text()).toContain('Loading...')
  })

  it('renders an empty state', () => {
    const wrapper = mount(BaseDataTable, {
      props: {
        columns,
        rows: [],
        emptyTitle: 'No drivers found',
        emptyDescription: 'Try another keyword.',
      },
    })

    expect(wrapper.text()).toContain('No drivers found')
    expect(wrapper.text()).toContain('Try another keyword.')
  })

  it('emits row-click when a row is selected', async () => {
    const wrapper = mount(BaseDataTable, {
      props: { columns, rows },
    })

    await wrapper.find('tbody tr').trigger('click')

    expect(wrapper.emitted('row-click')?.[0]).toEqual([rows[0]])
  })

  it('renders custom cell slots', () => {
    const wrapper = mount(BaseDataTable, {
      props: { columns, rows },
      slots: {
        'cell-status': ({ value }) => h('strong', value.toUpperCase()),
      },
    })

    expect(wrapper.find('strong').text()).toBe('ASSIGNED')
  })
})
