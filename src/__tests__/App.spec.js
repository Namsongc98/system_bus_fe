import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

describe('App', () => {
  it('renders the router outlet and toast container', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          UApp: { template: '<div><slot /></div>' },
          RouterView: { template: '<main data-test="router-view" />' },
        },
      },
    })

    expect(wrapper.find('[data-test="router-view"]').exists()).toBe(true)
    expect(wrapper.findComponent(ToastContainer).exists()).toBe(true)
  })
})
