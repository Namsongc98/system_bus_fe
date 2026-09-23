import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import router from './router'
import { resetStorePlugin } from './stores/plugins/resetStore'
import './assets/css/main.css'

const app = createApp(App)

const pinia = createPinia()
pinia.use(resetStorePlugin)

app.use(pinia)
app.use(router)
app.use(ui)

app.mount('#app')
