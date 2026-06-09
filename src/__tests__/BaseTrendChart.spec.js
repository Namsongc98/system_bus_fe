import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseTrendChart from '@/components/elements/BaseTrendChart.vue'

const items = [
  { label: 'JAN', value: 38, heightClass: 'h-20' },
  { label: 'FEB', value: 52, heightClass: 'h-28' },
]

function mountChart(props = {}) {
  return mount(BaseTrendChart, {
    props: {
      title: 'Revenue Trend',
      description: 'Monthly breakdown of income performance',
      items,
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

describe('BaseTrendChart', () => {
  it('renders title and description', () => {
    const wrapper = mountChart()

    expect(wrapper.text()).toContain('Revenue Trend')
    expect(wrapper.text()).toContain('Monthly breakdown of income performance')
  })

  it('renders chart items and labels', () => {
    const wrapper = mountChart()

    expect(wrapper.text()).toContain('JAN')
    expect(wrapper.text()).toContain('FEB')
    expect(wrapper.find('[aria-label="JAN: 38"]').exists()).toBe(true)
  })

  it('emits update:modelValue when selecting another tab', async () => {
    const wrapper = mountChart()

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Weekly')
      .trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['weekly'])
  })

  it('uses the chart tab color variant', () => {
    const wrapper = mountChart()
    const weekly = wrapper.findAll('button').find((button) => button.text() === 'Weekly')
    const monthly = wrapper.findAll('button').find((button) => button.text() === 'Monthly')

    expect(monthly.classes()).toContain('bg-sky-700')
    expect(monthly.classes()).toContain('text-white')
    expect(weekly.classes()).toContain('bg-white/70')
    expect(weekly.classes()).not.toContain('bg-sky-700')
  })

  it('renders loading state', () => {
    const wrapper = mountChart({ loading: true })

    expect(wrapper.text()).toContain('Loading chart...')
  })

  it('renders empty state when no items are available', () => {
    const wrapper = mountChart({
      items: [],
      emptyTitle: 'No revenue data',
      emptyDescription: 'Revenue performance will appear later.',
    })

    expect(wrapper.text()).toContain('No revenue data')
    expect(wrapper.text()).toContain('Revenue performance will appear later.')
  })
})
