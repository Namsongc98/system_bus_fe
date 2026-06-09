import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RouteNetworkCard from '@/components/common/RouteNetworkCard.vue'

const route = {
  id: 7,
  origin: 'London',
  destination: 'Manchester',
  subtitle: 'Northern Express',
  distance: 312,
  averageTime: '4h 20m',
  stops: 3,
  status: 'active',
  demandLabel: 'High Demand',
  demandTone: 'high',
  activeBuses: 5,
}

function mountCard() {
  return mount(RouteNetworkCard, {
    props: {
      route,
    },
    global: {
      stubs: {
        UButton: {
          props: ['disabled', 'loading', 'type'],
          emits: ['click'],
          template:
            '<button v-bind="$attrs" :type="type || `button`" :disabled="disabled || loading" @click="$emit(`click`)"><slot name="leading" /><slot /><slot name="trailing" /></button>',
        },
        UIcon: {
          template: '<span data-testid="icon"></span>',
        },
      },
    },
  })
}

describe('RouteNetworkCard', () => {
  it('emits select when the select control is clicked', async () => {
    const wrapper = mountCard()

    await wrapper.get('[aria-label="Select London to Manchester"]').trigger('change')

    expect(wrapper.emitted('select')?.[0]?.[0]).toEqual(route)
    expect(wrapper.emitted('delete')).toBeUndefined()
  })

  it('reflects selected state in the switch checkbox', () => {
    const wrapper = mount(RouteNetworkCard, {
      props: {
        route,
        selected: true,
      },
      global: {
        stubs: {
          UButton: {
            props: ['disabled', 'loading', 'type'],
            emits: ['click'],
            template:
              '<button v-bind="$attrs" :type="type || `button`" :disabled="disabled || loading" @click="$emit(`click`)"><slot name="leading" /><slot /><slot name="trailing" /></button>',
          },
          UIcon: {
            template: '<span data-testid="icon"></span>',
          },
        },
      },
    })

    expect(wrapper.get('input[type="checkbox"]').element.checked).toBe(true)
  })

  it('emits delete without selecting the route when the trash control is clicked', async () => {
    const wrapper = mountCard()

    await wrapper.get('[aria-label="Delete route London to Manchester"]').trigger('click')

    expect(wrapper.emitted('delete')?.[0]?.[0]).toEqual(route)
    expect(wrapper.emitted('select')).toBeUndefined()
  })
})
