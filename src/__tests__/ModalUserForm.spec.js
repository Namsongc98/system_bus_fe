import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ModalUserForm from '@/components/common/Modal/ModalUserForm.vue'

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

const store = vi.hoisted(() => ({
  saving: false,
  createUser: vi.fn(),
  updateUser: vi.fn(),
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => store,
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => toast,
}))

function mountModal(props = {}) {
  return mount(ModalUserForm, {
    props: { modelValue: true, ...props },
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
            '<button v-bind="$attrs" :type="htmlType || `button`" :disabled="disabled || loading" @click="$emit(`click`)"><slot name="icon-left" /><slot /></button>',
        },
        BaseInput: {
          props: ['modelValue', 'type', 'label', 'placeholder', 'error', 'disabled'],
          emits: ['update:modelValue'],
          template:
            '<label><span v-if="label">{{ label }}</span><input :data-label="label" :type="type || `text`" :value="modelValue" :disabled="disabled" @input="$emit(`update:modelValue`, $event.target.value)" /><span v-if="error" class="field-error">{{ error }}</span></label>',
        },
        UIcon: { template: '<span data-testid="icon"></span>' },
      },
    },
  })
}

function input(wrapper, label) {
  return wrapper.get(`input[data-label="${label}"]`)
}

function roleButton(wrapper, label) {
  return wrapper.findAll('[role="radio"]').find((button) => button.text() === label)
}

const driver = {
  id: 5,
  email: 'd@test.vn',
  role: 'DRIVER',
  fullName: 'Tài Xế',
  phone: '0901',
  active: true,
}

describe('ModalUserForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.saving = false
    store.createUser.mockResolvedValue({ id: 9 })
    store.updateUser.mockResolvedValue({ id: 5 })
  })

  it('create mode asks for email, password, name, phone and one of the three assignable roles', () => {
    const wrapper = mountModal()

    expect(wrapper.text()).toContain('Create User')
    expect(wrapper.find('input[data-label="Email"]').exists()).toBe(true)
    expect(wrapper.find('input[data-label="Initial password"]').exists()).toBe(true)
    expect(wrapper.findAll('[role="radio"]').map((b) => b.text())).toEqual([
      'Driver',
      'Collector',
      'Customer',
    ])
  })

  it('validates required fields before calling the store', async () => {
    const wrapper = mountModal()

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Enter an email')
    expect(wrapper.text()).toContain('Enter an initial password')
    expect(wrapper.text()).toContain('Enter a full name')
    expect(store.createUser).not.toHaveBeenCalled()
  })

  it('rejects a bad email and a short password', async () => {
    const wrapper = mountModal()
    await input(wrapper, 'Email').setValue('not-an-email')
    await input(wrapper, 'Initial password').setValue('123')
    await input(wrapper, 'Full name').setValue('A')

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Enter a valid email')
    expect(wrapper.text()).toContain('Use 6 to 72 characters')
    expect(store.createUser).not.toHaveBeenCalled()
  })

  it('creates with trimmed values, toasts and closes', async () => {
    const wrapper = mountModal()
    await input(wrapper, 'Email').setValue('  new@test.vn ')
    await input(wrapper, 'Initial password').setValue('secret1')
    await input(wrapper, 'Full name').setValue('  Người Mới ')
    await roleButton(wrapper, 'Driver').trigger('click')

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(store.createUser).toHaveBeenCalledWith({
      email: 'new@test.vn',
      password: 'secret1',
      fullName: 'Người Mới',
      phone: null,
      role: 'DRIVER',
    })
    expect(toast.success).toHaveBeenCalledWith('User created successfully')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.emitted('saved')[0]).toEqual([{ id: 9 }])
  })

  it('edit mode prefills, hides email/password and sends only name, phone and role', async () => {
    const wrapper = mountModal({ user: driver })

    expect(wrapper.text()).toContain('Edit User')
    expect(wrapper.text()).toContain('d@test.vn')
    expect(wrapper.find('input[data-label="Email"]').exists()).toBe(false)
    expect(wrapper.find('input[data-label="Initial password"]').exists()).toBe(false)
    expect(input(wrapper, 'Full name').element.value).toBe('Tài Xế')

    await roleButton(wrapper, 'Collector').trigger('click')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(store.updateUser).toHaveBeenCalledWith(5, {
      fullName: 'Tài Xế',
      phone: '0901',
      role: 'COLLECTOR',
    })
    expect(toast.success).toHaveBeenCalledWith('User updated successfully')
  })

  it('shows an ADMIN role read-only so it can be kept but not chosen', async () => {
    const wrapper = mountModal({ user: { ...driver, id: 3, role: 'ADMIN' } })

    const adminOption = roleButton(wrapper, 'Admin')
    expect(adminOption.attributes('aria-checked')).toBe('true')
    expect(adminOption.attributes('disabled')).toBeDefined()

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(store.updateUser).toHaveBeenCalledWith(3, expect.objectContaining({ role: 'ADMIN' }))
  })

  it('maps BE field errors to the inputs and keeps the modal open', async () => {
    store.createUser.mockRejectedValue(
      Object.assign(new Error('Email không đúng định dạng'), {
        status: 400,
        errors: { email: 'Email không đúng định dạng' },
      })
    )
    const wrapper = mountModal()
    await input(wrapper, 'Email').setValue('a@b.co')
    await input(wrapper, 'Initial password').setValue('secret1')
    await input(wrapper, 'Full name').setValue('A')

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('.field-error').text()).toBe('Email không đúng định dạng')
    expect(toast.error).toHaveBeenCalledWith('Email không đúng định dạng')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('toasts a 409 from the BE', async () => {
    store.updateUser.mockRejectedValue(
      Object.assign(new Error('Tài xế còn chuyến chưa kết thúc, không thể đổi vai trò'), {
        status: 409,
      })
    )
    const wrapper = mountModal({ user: driver })
    await roleButton(wrapper, 'Customer').trigger('click')

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith(
      'Tài xế còn chuyến chưa kết thúc, không thể đổi vai trò'
    )
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('does not close while saving', async () => {
    store.saving = true
    const wrapper = mountModal({ user: driver })

    await wrapper.get('[aria-label="Close user modal"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
