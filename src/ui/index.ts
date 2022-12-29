import { createApp as vueCreateApp } from 'vue'
import './style.css'
import App from './App.vue'

export const createApp = () => {
    const app = vueCreateApp(App)
    return app
}
