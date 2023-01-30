import { ZQMapPosition } from '../../lib/position'
import { runInitInterval } from '../base'
import { LeafletRule } from '../leaflet'
import './v3.scss'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KongyingAny = any
export class KongyingV3Rule extends LeafletRule {
    static rule = ['v3.yuanshen.site']
    vue: KongyingAny
    root: KongyingAny
    async init(): Promise<void> {
        this.window.document.body.classList.add('zhiqiong-rule-kongyingv3')
        await runInitInterval(() => {
            this.vue = (<KongyingAny>this.window.document.querySelector('#q-app'))?.__vue_app__
            this.root = this.vue._container?._vnode?.component
            this.map = this.root?.subTree?.component?.subTree?.component?.ctx?.map
            return !!(this.vue && this.root && this.map)
        })
        await super.init()
    }
    setPosition(pos: ZQMapPosition) {
        const y = pos.x / 1.5
        const x = pos.y / 1.5
        pos.x = y
        pos.y = x
        pos.characterRotation = 0 - pos.characterRotation
        pos.viewportRotation = 0 - pos.viewportRotation
        return super.setPosition(pos)
    }
}
