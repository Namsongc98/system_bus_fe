import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusToggle from '@/components/common/StatusToggle.vue'

function mountToggle(props = {}) {
  return mount(StatusToggle, {
    props: {
      modelValue: true,
      label: 'Route Status',
      ...props,
    },
  })
}

describe('StatusToggle', () => {
  it('renders the label, current state, and switch semantics', () => {
    const wrapper = mountToggle()
    const input = wrapper.get('input[type="checkbox"]')

    expect(wrapper.text()).toContain('Route Status')
    expect(wrapper.text()).toContain('Active')
    expect(input.attributes('role')).toBe('switch')
    expect(input.attributes('aria-checked')).toBe('true')
    expect(input.attributes('aria-label')).toBe('Route Status: Active')
  })

  it('emits model updates when toggled', async () => {
    const wrapper = mountToggle()

    await wrapper.get('input').setValue(false)

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    expect(wrapper.emitted('change')).toEqual([[false]])
  })

  it('does not emit while disabled', async () => {
    const wrapper = mountToggle({ disabled: true })

    await wrapper.get('input').trigger('change')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })
})
