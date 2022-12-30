import { ZhiqiongApp } from './../lib/app'
import { ZQMapPosition } from './../lib/position'
import type { unsafeWindow } from '$'
import { RuleItem } from './../lib/ruleMatcher'
export abstract class BaseRule {
    static rule: RuleItem[] = []
    app: ZhiqiongApp
    window: typeof unsafeWindow
    constructor(app: ZhiqiongApp) {
        this.app = app
        this.window = app.window
    }
    abstract init(): Promise<void>
    abstract setOverlay(enable: boolean): void
    abstract setPosition(pos: ZQMapPosition): void
    async getMountpoint(): Promise<HTMLElement> {
        return (document.querySelector('.mhy-map-container') ||
            document.querySelector('.btn-wrap') ||
            document.body) as HTMLElement
    }
}

export const runInitInterval = (cb: () => boolean) => {
    return new Promise<void>((resolve) => {
        if (cb()) {
            resolve()
            return
        }
        const initInterval = setInterval(() => {
            if (!cb()) return
            clearInterval(initInterval)
            resolve()
        }, 500)
    })
}
