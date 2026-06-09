import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BasePagination from '@/components/elements/BasePagination.vue'

function mountPagination(props = {}) {
  return mount(BasePagination, {
    props: {
      page: 0,
      totalPages: 3,
      hasPrevPage: false,
      hasNextPage: true,
      loading: false,
      ...props,
    },
    global: {
      stubs: {
        UButton: {
          props: ['disabled', 'loading', 'type'],
          emits: ['click'],
          template:
            '<button :type="type" :disabled="disabled || loading" @click="$emit(`click`)"><slot /></button>',
        },
      },
    },
  })
}

describe('BasePagination', () => {
  it('renders current page and total pages', () => {
    const wrapper = mountPagination({ page: 1, totalPages: 4 })

    expect(wrapper.text()).toContain('Page 2 of 4')
  })

  it('disables previous and next buttons from props', () => {
    const wrapper = mountPagination({ hasPrevPage: false, hasNextPage: false })
    const buttons = wrapper.findAll('button')

    expect(buttons[0].attributes('disabled')).toBeDefined()
    expect(buttons[1].attributes('disabled')).toBeDefined()
  })

  it('emits prev and next events', async () => {
    const wrapper = mountPagination({ hasPrevPage: true, hasNextPage: true })
    const buttons = wrapper.findAll('button')

    await buttons[0].trigger('click')
    await buttons[1].trigger('click')

    expect(wrapper.emitted('prev')).toHaveLength(1)
    expect(wrapper.emitted('next')).toHaveLength(1)
  })
})
