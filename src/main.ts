import { RuleList } from './rules/index'
import { GM, unsafeWindow } from '$'
import { ZhiqiongApp } from './lib/app'
import { ruleMatcher } from './lib/ruleMatcher'

import type * as L from 'leaflet'
declare global {
    interface Window {
        $map: ZhiqiongApp
        L: typeof L
        map: L.Map
        chrome: {
            webview: {
                postMessage: (message: unknown) => void
            }
        }
    }
}

;(async () => {
    const rules = ruleMatcher(unsafeWindow.location, RuleList)
    if (rules.length === 1) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        unsafeWindow.$map = await new ZhiqiongApp(rules[0] as any, unsafeWindow)
        GM.registerMenuCommand('设置', () => {
            unsafeWindow.$map.showSettings = true
        })
    }
})()
