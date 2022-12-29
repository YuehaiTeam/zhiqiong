import type { unsafeWindow } from '$'
import { RuleItem } from './../lib/ruleMatcher'
export abstract class BaseRule {
    static rule: RuleItem[] = []
    window: typeof unsafeWindow
    constructor(window: typeof unsafeWindow) {
        this.window = window
    }
    abstract init(): Promise<void>
    abstract getMountpoint(): Promise<HTMLElement>
}

export const runInitInterval = (cb: () => boolean) => {
    return new Promise<void>((resolve) => {
        if (cb()) return
        const initInterval = setInterval(() => {
            if (!cb()) return
            clearInterval(initInterval)
            resolve()
        }, 500)
    })
}
