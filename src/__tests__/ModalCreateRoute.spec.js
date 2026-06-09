import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ModalCreateRoute from '@/components/common/Modal/ModalCreateRoute.vue'
import { routeService } from '@/services/busRouteService'

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('@/services/busRouteService', () => ({
  routeService: {
    create: vi.fn(),
  },
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => toast,
}))

function mountModal(props = {}) {
  return mount(ModalCreateRoute, {
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
            '<button :type="htmlType || type || `button`" :disabled="disabled || loading" @click="$emit(`click`)"><slot /><slot name="icon-right" /></button>',
        },
        BaseInput: {
          props: ['modelValue', 'type', 'label', 'placeholder', 'error', 'disabled'],
          emits: ['update:modelValue'],
          template:
            '<label><span v-if="label">{{ label }}</span><slot name="leading" /><input :type="type || `text`" :placeholder="placeholder" :value="modelValue" :disabled="disabled" @input="$emit(`update:modelValue`, $event.target.value)" /><slot name="trailing" /><span v-if="error">{{ error }}</span></label>',
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
  await inputs[0].setValue('Coastal Express Alpha')
  await inputs[1].setValue('Origin Terminal')
  await inputs[2].setValue('Destination Terminal')
  await inputs[3].setValue('125.5')
}

describe('ModalCreateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routeService.create.mockResolvedValue({
      data: {
        data: { id: 12, routeName: 'Coastal Express Alpha' },
      },
    })
  })

  it('renders route form fields and preview', () => {
    const wrapper = mountModal()

    expect(wrapper.text()).toContain('Create New Route')
    expect(wrapper.text()).toContain('Route Name')
    expect(wrapper.text()).toContain('Route Points')
    expect(wrapper.text()).toContain('Route Preview')
    expect(wrapper.text()).toContain('0 / 50')
  })

  it('shows validation errors for missing required fields', async () => {
    const wrapper = mountModal()

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Enter a route name')
    expect(wrapper.text()).toContain('Enter a start point')
    expect(wrapper.text()).toContain('Enter an end point')
    expect(wrapper.text()).toContain('Enter route distance')
    expect(routeService.create).not.toHaveBeenCalled()
  })

  it('validates route name length and positive distance', async () => {
    const wrapper = mountModal()
    const inputs = wrapper.findAll('input')

    await inputs[0].setValue('A'.repeat(51))
    await inputs[1].setValue('Origin Terminal')
    await inputs[2].setValue('Destination Terminal')
    await inputs[3].setValue('0')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Route name must be 50 characters or less')
    expect(wrapper.text()).toContain('Distance must be greater than 0')
    expect(routeService.create).not.toHaveBeenCalled()
  })

  it('submits an ACTIVE route payload and closes on success', async () => {
    const wrapper = mountModal()

    await fillValidForm(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(routeService.create).toHaveBeenCalledWith({
      routeName: 'Coastal Express Alpha',
      startPoint: 'Origin Terminal',
      endPoint: 'Destination Terminal',
      distanceKm: 125.5,
      status: 'ACTIVE',
    })
    expect(toast.success).toHaveBeenCalledWith('Route created successfully')
    expect(wrapper.emitted('created')?.[0]?.[0]).toEqual({
      id: 12,
      routeName: 'Coastal Express Alpha',
    })
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
  })

  it('submits INACTIVE status after toggling route status', async () => {
    const wrapper = mountModal()

    await fillValidForm(wrapper)
    await wrapper.get('[aria-label="Route Status: Active"]').setValue(false)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(routeService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'INACTIVE',
      })
    )
  })

  it('keeps the modal open and shows a toast when create fails', async () => {
    routeService.create.mockRejectedValueOnce(new Error('Create route failed'))
    const wrapper = mountModal()

    await fillValidForm(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith('Create route failed')
    expect(wrapper.emitted('created')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
