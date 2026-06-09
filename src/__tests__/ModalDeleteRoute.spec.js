import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ModalDeleteRoute from '@/components/common/Modal/ModalDeleteRoute.vue'
import { routeService } from '@/services/busRouteService'

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('@/services/busRouteService', () => ({
  routeService: {
    remove: vi.fn(),
  },
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => toast,
}))

const route = {
  id: 42,
  origin: 'Ho Chi Minh City',
  destination: 'Da Lat',
  name: 'Southern Highland Express',
  activeTripCount: 12,
}

function mountModal(props = {}) {
  return mount(ModalDeleteRoute, {
    props: {
      modelValue: true,
      route,
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
            '<button v-bind="$attrs" :type="htmlType || type || `button`" :disabled="disabled || loading" @click="$emit(`click`)"><slot /></button>',
        },
        BaseInput: {
          props: ['modelValue', 'placeholder', 'disabled'],
          emits: ['update:modelValue'],
          template:
            '<input v-bind="$attrs" :placeholder="placeholder" :value="modelValue" :disabled="disabled" @input="$emit(`update:modelValue`, $event.target.value)" />',
        },
        UIcon: {
          template: '<span data-testid="icon"></span>',
        },
      },
    },
  })
}

describe('ModalDeleteRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routeService.remove.mockResolvedValue({ data: {} })
  })

  it('renders warning content, route name, active trip impact, and confirmation input', () => {
    const wrapper = mountModal()

    expect(wrapper.text()).toContain('Delete Route?')
    expect(wrapper.text()).toContain('This action cannot be undone')
    expect(wrapper.text()).toContain('Affected Route')
    expect(wrapper.text()).toContain('Southern Highland Express')
    expect(wrapper.text()).toContain('12 active trips will be cancelled')
    expect(wrapper.find('input[placeholder="Type route name here"]').exists()).toBe(true)
  })

  it('keeps Delete Route disabled until the exact route name is typed', async () => {
    const wrapper = mountModal()
    const deleteButton = () =>
      wrapper.findAll('button').find((button) => button.text().includes('Delete Route'))

    expect(deleteButton().attributes('disabled')).toBeDefined()

    await wrapper.get('input').setValue('Southern Highland')
    expect(deleteButton().attributes('disabled')).toBeDefined()

    await wrapper.get('input').setValue('Southern Highland Express')
    expect(deleteButton().attributes('disabled')).toBeUndefined()
  })

  it('calls the delete API and closes on success', async () => {
    const wrapper = mountModal()

    await wrapper.get('input').setValue('Southern Highland Express')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(routeService.remove).toHaveBeenCalledWith(42)
    expect(toast.success).toHaveBeenCalledWith('Route deleted successfully')
    expect(wrapper.emitted('deleted')?.[0]?.[0]).toEqual(route)
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
  })

  it('keeps the modal open and shows a toast when delete fails', async () => {
    routeService.remove.mockRejectedValueOnce(new Error('Delete route failed'))
    const wrapper = mountModal()

    await wrapper.get('input').setValue('Southern Highland Express')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith('Delete route failed')
    expect(wrapper.emitted('deleted')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
