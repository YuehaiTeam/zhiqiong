import { createPinia } from 'pinia'
import { useStore } from './store'
import type { unsafeWindow } from '$'
import { BaseRule } from '../rules/base'
import { createApp } from '../ui'
import overlays from '../data/overlays'
import { ruleMatcher } from './ruleMatcher'

export class ZhiqiongApp {
    rule: BaseRule
    window: typeof unsafeWindow
    store: ReturnType<typeof useStore>
    app: ReturnType<typeof createApp>
    mounted = false
    root = document.createElement('section')
    constructor(rule: BaseRule, window: typeof unsafeWindow) {
        this.rule = rule
        this.window = window
        this.app = createApp().use(createPinia())
        this.store = useStore()
        this.store.matchedOverlays = ruleMatcher(window.location, overlays)
        this.init()
    }
    async init() {
        if (this.mounted) return
        await this.rule.init()
        const mp = await this.rule.getMountpoint()
        this.root.id = 'cocogoat-root'
        mp.appendChild(this.root)
        this.app.mount(this.root)
        this.mounted = true
    }
}
