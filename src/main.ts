import { RuleList } from './rules/index'
import { unsafeWindow } from '$'
import { ZhiqiongApp } from './lib/app'
import { ruleMatcher } from './lib/ruleMatcher'

import type * as L from 'leaflet'

declare global {
    interface Window {
        $map: ZhiqiongApp
        L: typeof L
    }
}
const rules = ruleMatcher(unsafeWindow.location, RuleList)
if (rules.length === 1) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unsafeWindow.$map = new ZhiqiongApp(new (rules[0] as any)(unsafeWindow), unsafeWindow)
}
