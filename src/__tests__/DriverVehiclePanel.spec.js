import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DriverVehiclePanel from '@/components/common/DriverVehiclePanel.vue'

const driver = { id: 1, name: 'Nguyen Van A', contact: '0901000001' }
const assignedBuses = [
  { id: 10, label: '51A-123.45', meta: 'Limousine · 34 seats', raw: { id: 10 } },
]
const availableBuses = [
  { id: 10, label: '51A-123.45', meta: 'Limousine · 34 seats', current: true },
  { id: 11, label: '51B-222.22', meta: 'Sleeper · 40 seats' },
]
const assignedToOtherBuses = [{ id: 12, label: '51C-333.33', driverName: 'Tran Van B' }]

function mountPanel(props = {}) {
  return mount(DriverVehiclePanel, {
    props: {
      driver,
      assignedBuses,
      availableBuses,
      assignedToOtherBuses,
      selectedVehicleId: '',
      saving: false,
      error: '',
      ...props,
    },
    global: {
      stubs: {
        UButton: {
          props: ['disabled', 'loading', 'type'],
          emits: ['click'],
          template:
            '<button :type="type" :disabled="disabled || loading" @click="$emit(`click`)"><slot /></button>',
        },
      },
    },
  })
}

describe('DriverVehiclePanel', () => {
  it('renders selected driver, assigned buses, and unavailable buses', () => {
    const wrapper = mountPanel()

    expect(wrapper.text()).toContain('Nguyen Van A')
    expect(wrapper.text()).toContain('51A-123.45')
    expect(wrapper.text()).toContain('51C-333.33')
    expect(wrapper.text()).toContain('Assigned to other drivers')
  })

  it('emits assign when saving the selected bus', async () => {
    const wrapper = mountPanel({ selectedVehicleId: 11 })

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Save assignment')
      .trigger('click')

    expect(wrapper.emitted('assign')).toHaveLength(1)
  })

  it('emits remove-bus with the selected bus', async () => {
    const wrapper = mountPanel()

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Remove')
      .trigger('click')

    expect(wrapper.emitted('remove-bus')?.[0]).toEqual([assignedBuses[0]])
  })

  it('emits selected vehicle updates from radio input', async () => {
    const wrapper = mountPanel()

    await wrapper.find('input[value="11"]').setValue(true)

    expect(wrapper.emitted('update:selectedVehicleId')?.[0]).toEqual([11])
  })

  it('renders error and empty assigned state', () => {
    const wrapper = mountPanel({
      assignedBuses: [],
      error: 'Update failed',
    })

    expect(wrapper.text()).toContain('This driver has no assigned bus.')
    expect(wrapper.text()).toContain('Update failed')
  })
})
