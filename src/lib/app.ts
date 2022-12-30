import { ZQMapOverlay } from './overlay'
import type { unsafeWindow } from '$'
import { BaseRule } from '../rules/base'
import { createApp } from '../ui'
import overlays from '../data/overlays'
import { ruleMatcher } from './ruleMatcher'
import { getSyncOptions, ZhiqiongGlobalOptions } from './store'
import { markRaw, reactive, watch } from 'vue'

export class ZhiqiongApp {
    rule: BaseRule
    window: typeof unsafeWindow
    app: ReturnType<typeof createApp>
    root = markRaw(document.createElement('section'))
    matchedOverlays: ZQMapOverlay<unknown>[]
    options!: ZhiqiongGlobalOptions

    ws?: WebSocket

    isPinned = false
    isShared = false
    isShowOverlay = false

    showSettings = false

    notify = ''
    notifyProgress = -1

    constructor(rule: typeof BaseRule, window: typeof unsafeWindow) {
        const reactiveThis = reactive(this)
        this.window = markRaw(window)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.rule = markRaw(new (rule as any)(reactiveThis))
        this.app = markRaw(createApp(reactiveThis))
        this.matchedOverlays = markRaw(ruleMatcher(window.location, overlays))
        watch(
            () => reactiveThis.isShowOverlay,
            (val) => reactiveThis.rule.setOverlay(val),
        )
        const init = (async () => {
            reactiveThis.options = await getSyncOptions()
            await reactiveThis.rule.init()
            const mp = await reactiveThis.rule.getMountpoint()
            reactiveThis.root.id = 'zhiqiong-root'
            mp.appendChild(reactiveThis.root)
            reactiveThis.app.mount(reactiveThis.root)
            reactiveThis.rule.setPosition({
                x: 0,
                y: 0,
                characterRotation: 0,
                viewportRotation: 0,
                mapId: 0,
                err: 0,
                errors: [],
            })
        })()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-constructor-return
        return init.then(() => reactive(this))
    }
}
