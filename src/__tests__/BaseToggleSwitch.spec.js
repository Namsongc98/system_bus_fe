import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseToggleSwitch from '@/components/elements/BaseToggleSwitch.vue'

function mountSwitch(props = {}) {
  return mount(BaseToggleSwitch, {
    props: {
      ariaLabel: 'Enable route',
      ...props,
    },
  })
}

describe('BaseToggleSwitch', () => {
  it('renders a checkbox switch with an accessible label', () => {
    const wrapper = mountSwitch()
    const input = wrapper.get('input[type="checkbox"]')

    expect(input.attributes('role')).toBe('switch')
    expect(input.attributes('aria-label')).toBe('Enable route')
    expect(input.attributes('aria-checked')).toBe('false')
  })

  it('reflects the current model value', () => {
    const wrapper = mountSwitch({ modelValue: true })

    expect(wrapper.get('input').element.checked).toBe(true)
    expect(wrapper.get('input').attributes('aria-checked')).toBe('true')
  })

  it('emits model and change events when toggled', async () => {
    const wrapper = mountSwitch()

    await wrapper.get('input').setValue(true)

    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    expect(wrapper.emitted('change')).toEqual([[true]])
  })

  it('does not emit while disabled', async () => {
    const wrapper = mountSwitch({ disabled: true })

    await wrapper.get('input').trigger('change')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('renders custom on and off labels as switch data attributes', () => {
    const wrapper = mountSwitch({
      onLabel: 'Active',
      offLabel: 'Inactive',
    })
    const track = wrapper.get('[data-on-label]')

    expect(track.attributes('data-on-label')).toBe('Active')
    expect(track.attributes('data-off-label')).toBe('Inactive')
  })
})
