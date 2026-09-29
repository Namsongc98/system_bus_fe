import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ModalUserStatus from '@/components/common/Modal/ModalUserStatus.vue'

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

const store = vi.hoisted(() => ({
  statusUpdatingId: null,
  setUserActive: vi.fn(),
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => store,
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => toast,
}))

function mountModal(user) {
  return mount(ModalUserStatus, {
    props: { modelValue: true, user },
    global: {
      stubs: {
        BaseModal: {
          props: ['modelValue', 'size'],
          template: '<div v-if="modelValue"><slot /></div>',
        },
        BaseButton: {
          props: {
            disabled: { type: Boolean, default: false },
            loading: { type: Boolean, default: false },
          },
          emits: ['click'],
          template:
            '<button :disabled="disabled || loading" @click="$emit(`click`)"><slot /></button>',
        },
        UIcon: { template: '<span></span>' },
      },
    },
  })
}

function button(wrapper, text) {
  return wrapper.findAll('button').find((b) => b.text().includes(text))
}

const active = { id: 4, email: 'd@test.vn', fullName: 'Tài Xế', active: true }

describe('ModalUserStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.statusUpdatingId = null
  })

  it('locks an active user and closes', async () => {
    store.setUserActive.mockResolvedValue({ ...active, active: false })
    const wrapper = mountModal(active)

    expect(wrapper.text()).toContain('Lock account?')
    expect(wrapper.text()).toContain('Tài Xế')
    await button(wrapper, 'Lock account').trigger('click')
    await flushPromises()

    expect(store.setUserActive).toHaveBeenCalledWith(4, false)
    expect(toast.success).toHaveBeenCalledWith('User locked')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('unlocks a locked user', async () => {
    store.setUserActive.mockResolvedValue({ ...active })
    const wrapper = mountModal({ ...active, active: false, fullName: null })

    expect(wrapper.text()).toContain('Unlock account?')
    expect(wrapper.text()).toContain('d@test.vn')
    await button(wrapper, 'Unlock account').trigger('click')
    await flushPromises()

    expect(store.setUserActive).toHaveBeenCalledWith(4, true)
    expect(toast.success).toHaveBeenCalledWith('User unlocked')
  })

  it('toasts a 409 and stays open', async () => {
    store.setUserActive.mockRejectedValue(
      Object.assign(new Error('Không thể khoá quản trị viên cuối cùng đang hoạt động'), {
        status: 409,
      })
    )
    const wrapper = mountModal(active)

    await button(wrapper, 'Lock account').trigger('click')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith(
      'Không thể khoá quản trị viên cuối cùng đang hoạt động'
    )
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('cannot be closed while the request is in flight', async () => {
    store.statusUpdatingId = 4
    const wrapper = mountModal(active)

    await button(wrapper, 'Cancel').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
