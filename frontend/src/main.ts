import './assets/styles/main.css'

import { createApp } from 'vue'
import { createWebHistory, createRouter } from 'vue-router'
import { createPinia } from 'pinia'
import { routes, setDocumentTitle } from './router'
import App from './App.vue'

const pinia = createPinia()

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  setDocumentTitle(to.name) 
})

createApp(App)
.use(pinia)
.use(router)
.mount('#app')
