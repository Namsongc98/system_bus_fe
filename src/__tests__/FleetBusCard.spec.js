import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import FleetBusCard from '@/components/common/FleetBusCard.vue'

const stubs = {
  UButton: {
    props: ['disabled', 'loading', 'type'],
    emits: ['click'],
    template:
      '<button v-bind="$attrs" :type="type || `button`" :disabled="disabled || loading" @click="$emit(`click`)"><slot /></button>',
  },
  UIcon: { template: '<span data-testid="icon"></span>' },
}

function mountCard(props) {
  return mount(FleetBusCard, { props, global: { stubs } })
}

describe('FleetBusCard', () => {
  it.each([
    ['AVAILABLE', 'Available'],
    ['IN_USE', 'In use'],
    ['MAINTENANCE', 'Maintenance'],
  ])('labels status %s as %s', (status, label) => {
    const wrapper = mountCard({ bus: { id: 1, plate: '51A-1', capacity: 45, status } })

    expect(wrapper.text()).toContain(label)
  })

  it('shows only fields the BE returns (D3 = A)', () => {
    const wrapper = mountCard({ bus: { id: 1, plate: '51A-1', capacity: 45, status: 'AVAILABLE' } })

    expect(wrapper.text()).toContain('51A-1')
    expect(wrapper.text()).toContain('45 seats')
    expect(wrapper.text()).not.toContain('Uptime')
    expect(wrapper.text()).not.toContain('Age')
  })

  it('emits edit and delete with the bus', async () => {
    const bus = { id: 1, plate: '51A-1', capacity: 45, status: 'AVAILABLE' }
    const wrapper = mountCard({ bus })

    await wrapper.get('[aria-label="Edit bus 51A-1"]').trigger('click')
    await wrapper.get('[aria-label="Delete bus 51A-1"]').trigger('click')

    expect(wrapper.emitted('edit')?.[0]).toEqual([bus])
    expect(wrapper.emitted('delete')?.[0]).toEqual([bus])
  })

  it('renders the add card as a button that emits add', async () => {
    const wrapper = mountCard({ bus: { id: 'new' }, isAddCard: true })

    await wrapper.get('[aria-label="Register vehicle"]').trigger('click')

    expect(wrapper.emitted('add')).toHaveLength(1)
  })
})
