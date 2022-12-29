import { ZQMapPosition } from './../../lib/position'
import * as L from 'leaflet'
import { runInitInterval } from '../base'
import { LeafletRule } from '../leaflet'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MiyousheAny = any
export class MiyousheRule extends LeafletRule {
    vue: MiyousheAny
    main: MiyousheAny
    gis: MiyousheAny
    static rule = ['webstatic.mihoyo.com']
    async init(): Promise<void> {
        this.window.document.body.classList.add('zhiqiong-rule-miyoushe')
        await runInitInterval(() => {
            this.vue = (<MiyousheAny>document.querySelector('#root'))?.__vue__
            this.main = this.vue?.$children[0]
            this.gis = this.main?.$children[0]
            this.map = this.gis?.$children[0]?.map || this.gis?.map
            if (!this.vue || !this.main || !this.map) return false
            return true
        })
        Object.defineProperty(this.gis, '$isMobile', {
            get() {
                return window.innerWidth <= 900
            },
        })
        await super.init()
    }
    setPosition(pos: ZQMapPosition) {
        pos.x = (pos.x + 5890) / 2
        pos.y = (pos.y - 2285) / 2
        pos.characterRotation = 0 - pos.characterRotation
        pos.viewportRotation = 0 - pos.viewportRotation
        return super.setPosition(pos)
    }
}
