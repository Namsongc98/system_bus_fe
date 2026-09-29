import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ModalCreateBus from '@/components/common/Modal/ModalCreateBus.vue'

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

const store = vi.hoisted(() => ({
  saving: false,
  createBus: vi.fn(),
  updateBus: vi.fn(),
}))

vi.mock('@/stores/busRoute', () => ({
  useBusRouteStore: () => store,
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
            '<button v-bind="$attrs" :type="htmlType || type || `button`" :disabled="disabled || loading" @click="$emit(`click`)"><slot name="icon-left" /><slot /></button>',
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
  await inputs[0].setValue('30B-67890')
  await inputs[1].setValue('45')
}

function statusButton(wrapper, label) {
  return wrapper.findAll('button').find((button) => button.text() === label)
}

describe('ModalCreateBus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.createBus.mockResolvedValue({ id: 7, plateNumber: '30B-67890' })
    store.updateBus.mockResolvedValue({ id: 3, plateNumber: '30B-00003' })
  })

  it('renders bus form fields and preview without a bus number field', () => {
    const wrapper = mountModal()

    expect(wrapper.text()).toContain('Add New Bus')
    expect(wrapper.text()).toContain('Plate Number')
    expect(wrapper.text()).toContain('Operational Status')
    expect(wrapper.text()).toContain('Seat Capacity')
    expect(wrapper.text()).toContain('Layout Preview')
    expect(wrapper.text()).not.toContain('Bus Number')
    expect(wrapper.findAll('input')).toHaveLength(2)
  })

  it('offers only Available and Maintenance when creating (IN_USE is system-set)', () => {
    const wrapper = mountModal()

    expect(statusButton(wrapper, 'Available')).toBeTruthy()
    expect(statusButton(wrapper, 'Maintenance')).toBeTruthy()
    expect(statusButton(wrapper, 'In use')).toBeUndefined()
  })

  it('shows validation errors for missing required fields', async () => {
    const wrapper = mountModal()
    const inputs = wrapper.findAll('input')
    await inputs[1].setValue('')

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Enter a plate number')
    expect(wrapper.text()).toContain('Enter seat capacity')
    expect(store.createBus).not.toHaveBeenCalled()
  })

  it('validates plate length and capacity greater than zero', async () => {
    const wrapper = mountModal()
    const inputs = wrapper.findAll('input')

    await inputs[0].setValue('X'.repeat(21))
    await inputs[1].setValue('0')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Plate number must be 20 characters or less')
    expect(wrapper.text()).toContain('Capacity must be a whole number greater than 0')
    expect(store.createBus).not.toHaveBeenCalled()
  })

  it('submits { plateNumber, capacity, status } and closes on success', async () => {
    const wrapper = mountModal()

    await fillValidForm(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(store.createBus).toHaveBeenCalledWith({
      plateNumber: '30B-67890',
      capacity: 45,
      status: 'AVAILABLE',
    })
    expect(toast.success).toHaveBeenCalledWith('Bus created successfully')
    expect(wrapper.emitted('saved')?.[0]?.[0]).toEqual({ id: 7, plateNumber: '30B-67890' })
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
  })

  it('submits the selected maintenance status', async () => {
    const wrapper = mountModal()

    await fillValidForm(wrapper)
    await statusButton(wrapper, 'Maintenance').trigger('click')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(store.createBus).toHaveBeenCalledWith(expect.objectContaining({ status: 'MAINTENANCE' }))
  })

  it('keeps the modal open and toasts the BE message when saving fails (409)', async () => {
    store.createBus.mockRejectedValueOnce(new Error('Biển số xe đã tồn tại: 30B-67890'))
    const wrapper = mountModal()

    await fillValidForm(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith('Biển số xe đã tồn tại: 30B-67890')
    expect(wrapper.emitted('saved')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('prefills the form in edit mode and calls updateBus', async () => {
    const wrapper = mountModal({
      bus: { id: 3, plateNumber: '30B-00003', capacity: 29, status: 'MAINTENANCE' },
    })

    expect(wrapper.text()).toContain('Edit Bus')
    const inputs = wrapper.findAll('input')
    expect(inputs[0].element.value).toBe('30B-00003')
    await inputs[1].setValue('30')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(store.updateBus).toHaveBeenCalledWith(3, {
      plateNumber: '30B-00003',
      capacity: 30,
      status: 'MAINTENANCE',
    })
    expect(store.createBus).not.toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Bus updated successfully')
  })

  it('shows IN_USE read-only on an IN_USE bus and keeps it by default', async () => {
    const wrapper = mountModal({
      bus: { id: 3, plateNumber: '30B-00003', capacity: 29, status: 'IN_USE' },
    })

    expect(statusButton(wrapper, 'In use').attributes('disabled')).toBeDefined()
    expect(statusButton(wrapper, 'In use').attributes('aria-checked')).toBe('true')
    expect(wrapper.text()).toContain('In use is set by the system')

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(store.updateBus).toHaveBeenCalledWith(3, expect.objectContaining({ status: 'IN_USE' }))
  })

  it('lets the admin free an IN_USE bus once its trip has ended (BE decides with 409)', async () => {
    store.updateBus.mockRejectedValueOnce(
      new Error('Xe 30B-00003 đang chạy chuyến, không thể đổi trạng thái')
    )
    const wrapper = mountModal({
      bus: { id: 3, plateNumber: '30B-00003', capacity: 29, status: 'IN_USE' },
    })

    await statusButton(wrapper, 'Maintenance').trigger('click')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(store.updateBus).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ status: 'MAINTENANCE' })
    )
    expect(toast.error).toHaveBeenCalledWith(
      'Xe 30B-00003 đang chạy chuyến, không thể đổi trạng thái'
    )
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('exposes the status options as a radio group', () => {
    const wrapper = mountModal()

    expect(wrapper.find('[role="radiogroup"]').attributes('aria-labelledby')).toBe(
      'bus-status-label'
    )
    expect(statusButton(wrapper, 'Available').attributes('aria-checked')).toBe('true')
    expect(statusButton(wrapper, 'Maintenance').attributes('aria-checked')).toBe('false')
  })

  it('cannot be closed while a save is in flight', async () => {
    store.saving = true
    const wrapper = mountModal()

    await wrapper.get('[aria-label="Close bus modal"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    store.saving = false
  })
})
