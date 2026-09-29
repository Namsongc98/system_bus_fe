import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ModalDeleteConfirm from '@/components/common/Modal/ModalDeleteConfirm.vue'

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => toast,
}))

const onConfirm = vi.fn()

function mountModal(props = {}) {
  return mount(ModalDeleteConfirm, {
    props: {
      modelValue: true,
      entityType: 'route',
      entityName: 'Southern Highland Express',
      onConfirm,
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

function deleteButton(wrapper, label) {
  return wrapper.findAll('button').find((button) => button.text().includes(label))
}

describe('ModalDeleteConfirm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    onConfirm.mockResolvedValue(undefined)
  })

  it('renders the route wording, name and confirmation input', () => {
    const wrapper = mountModal()

    expect(wrapper.text()).toContain('Delete Route?')
    expect(wrapper.text()).toContain('Southern Highland Express')
    expect(wrapper.find('input[aria-label="Type route name to confirm deletion"]').exists()).toBe(
      true
    )
  })

  it('renders the bus wording with the plate number to type', () => {
    const wrapper = mountModal({ entityType: 'bus', entityName: '51A-00001' })

    expect(wrapper.text()).toContain('Delete Bus?')
    expect(wrapper.text()).toContain('Type 51A-00001 to proceed.')
    expect(deleteButton(wrapper, 'Delete Bus')).toBeTruthy()
  })

  it('keeps Delete disabled until the exact name is typed (case-sensitive)', async () => {
    const wrapper = mountModal()
    const button = deleteButton(wrapper, 'Delete Route')

    expect(button.attributes('disabled')).toBeDefined()

    await wrapper.get('input').setValue('southern highland express')
    expect(button.attributes('disabled')).toBeDefined()

    await wrapper.get('input').setValue('Southern Highland Express')
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('calls onConfirm, toasts and closes on success', async () => {
    const wrapper = mountModal({ entityType: 'bus', entityName: '51A-00001' })

    await wrapper.get('input').setValue('51A-00001')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(toast.success).toHaveBeenCalledWith('Bus deleted successfully')
    expect(wrapper.emitted('deleted')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
  })

  it('keeps the modal open and toasts the BE reason on 409', async () => {
    onConfirm.mockRejectedValueOnce(
      new Error('Tuyến đã có lịch sử chuyến, hãy chuyển sang INACTIVE')
    )
    const wrapper = mountModal()

    await wrapper.get('input').setValue('Southern Highland Express')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith('Tuyến đã có lịch sử chuyến, hãy chuyển sang INACTIVE')
    expect(wrapper.emitted('deleted')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('does not call onConfirm without a matching name', async () => {
    const wrapper = mountModal()

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('cannot be closed while the delete is in flight', async () => {
    let finish
    onConfirm.mockReturnValueOnce(new Promise((resolve) => (finish = resolve)))
    const wrapper = mountModal()

    await wrapper.get('input').setValue('Southern Highland Express')
    await wrapper.get('form').trigger('submit')
    await wrapper.setProps({ modelValue: true })
    wrapper.vm.$.setupState.isOpen = false

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    finish()
    await flushPromises()
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
  })
})
