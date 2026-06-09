import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ModalCreateBus from '@/components/common/Modal/ModalCreateBus.vue'
import { busService } from '@/services/busRouteService'

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('@/services/busRouteService', () => ({
  busService: {
    create: vi.fn(),
  },
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => toast,
}))

function mountModal(props = {}) {
  return mount(ModalCreateBus, {
    props: {
      modelValue: true,
      ...props,
    },
    global: {
      stubs: {
        BaseModal: {
          props: ['modelValue', 'size'],
          emits: ['update:modelValue', 'close'],
          template: '<div v-if="modelValue"><slot /></div>',
        },
        BaseButton: {
          props: {
            disabled: { type: Boolean, default: false },
            loading: { type: Boolean, default: false },
            htmlType: { type: String, default: 'button' },
            type: { type: String, default: 'button' },
          },
          emits: ['click'],
          template:
            '<button :type="htmlType || type || `button`" :disabled="disabled || loading" @click="$emit(`click`)"><slot name="icon-left" /><slot /></button>',
        },
        BaseInput: {
          props: ['modelValue', 'type', 'label', 'placeholder', 'error', 'disabled'],
          emits: ['update:modelValue'],
          template:
            '<label><span v-if="label">{{ label }}</span><input :type="type || `text`" :placeholder="placeholder" :value="modelValue" :disabled="disabled" @input="$emit(`update:modelValue`, $event.target.value)" /><slot name="trailing" /><span v-if="error">{{ error }}</span></label>',
        },
        UIcon: {
          template: '<span data-testid="icon"></span>',
        },
      },
    },
  })
}

async function fillValidForm(wrapper) {
  const inputs = wrapper.findAll('input')
  await inputs[0].setValue('BUS-002')
  await inputs[1].setValue('30B-67890')
  await inputs[2].setValue('45')
}

describe('ModalCreateBus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    busService.create.mockResolvedValue({
      data: {
        data: { id: 7, busNumber: 'BUS-002' },
      },
    })
  })

  it('renders bus form fields and preview', () => {
    const wrapper = mountModal()

    expect(wrapper.text()).toContain('Add New Bus')
    expect(wrapper.text()).toContain('Bus Number')
    expect(wrapper.text()).toContain('Plate Number')
    expect(wrapper.text()).toContain('Operational Status')
    expect(wrapper.text()).toContain('Seat Capacity')
    expect(wrapper.text()).toContain('Layout Preview')
  })

  it('shows validation errors for missing required fields', async () => {
    const wrapper = mountModal()
    const inputs = wrapper.findAll('input')
    await inputs[2].setValue('')

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Enter a bus number')
    expect(wrapper.text()).toContain('Enter a license plate')
    expect(wrapper.text()).toContain('Enter seat capacity')
    expect(busService.create).not.toHaveBeenCalled()
  })

  it('validates capacity greater than zero', async () => {
    const wrapper = mountModal()
    const inputs = wrapper.findAll('input')

    await inputs[0].setValue('BUS-002')
    await inputs[1].setValue('30B-67890')
    await inputs[2].setValue('0')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Capacity must be greater than 0')
    expect(busService.create).not.toHaveBeenCalled()
  })

  it('submits the correct AVAILABLE bus payload and closes on success', async () => {
    const wrapper = mountModal()

    await fillValidForm(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(busService.create).toHaveBeenCalledWith({
      busNumber: 'BUS-002',
      licensePlate: '30B-67890',
      capacity: 45,
      status: 'AVAILABLE',
    })
    expect(toast.success).toHaveBeenCalledWith('Bus created successfully')
    expect(wrapper.emitted('created')?.[0]?.[0]).toEqual({ id: 7, busNumber: 'BUS-002' })
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
  })

  it('submits the selected maintenance status', async () => {
    const wrapper = mountModal()

    await fillValidForm(wrapper)
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Maintenance')
      .trigger('click')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(busService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'MAINTENANCE',
      })
    )
  })

  it('keeps the modal open and shows a toast when create fails', async () => {
    busService.create.mockRejectedValueOnce(new Error('Create bus failed'))
    const wrapper = mountModal()

    await fillValidForm(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith('Create bus failed')
    expect(wrapper.emitted('created')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
