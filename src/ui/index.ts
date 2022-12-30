import { ZhiqiongApp } from './../lib/app'
import { createApp as vueCreateApp } from 'vue'
import './style.scss'
import App from './App.vue'
import 'vant/lib/index.css'

export const createApp = (zqapp: ZhiqiongApp) => {
    const app = vueCreateApp(App, { app: zqapp })
    return app
}
