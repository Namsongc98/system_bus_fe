import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseTabs from '@/components/elements/BaseTabs.vue'

const options = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

function mountTabs(props = {}) {
  return mount(BaseTabs, {
    props: {
      options,
      modelValue: 'monthly',
      ...props,
    },
    global: {
      stubs: {
        UButton: {
          props: ['disabled', 'loading', 'type'],
          emits: ['click'],
          template:
            '<button :type="type" :disabled="disabled || loading" @click="$emit(`click`)"><slot name="leading" /><slot /><slot name="trailing" /></button>',
        },
      },
    },
  })
}

describe('BaseTabs', () => {
  it('keeps the default variant style unchanged', () => {
    const wrapper = mountTabs()
    const monthly = wrapper.findAll('button').find((button) => button.text() === 'Monthly')

    expect(wrapper.classes()).toContain('bg-stone-200')
    expect(monthly.classes()).toContain('bg-white')
    expect(monthly.classes()).toContain('text-zinc-900')
  })

  it('renders chart variant with Figma-like active and inactive colors', () => {
    const wrapper = mountTabs({ variant: 'chart' })
    const weekly = wrapper.findAll('button').find((button) => button.text() === 'Weekly')
    const monthly = wrapper.findAll('button').find((button) => button.text() === 'Monthly')

    expect(wrapper.classes()).toContain('bg-sky-50/80')
    expect(monthly.classes()).toContain('bg-sky-700')
    expect(monthly.classes()).toContain('text-white')
    expect(weekly.classes()).toContain('bg-white/70')
    expect(weekly.classes()).toContain('text-zinc-900')
  })

  it('emits when selecting another tab', async () => {
    const wrapper = mountTabs({ variant: 'chart' })

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Weekly')
      .trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['weekly'])
  })
})
