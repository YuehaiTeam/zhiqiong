import { ZQMapPosition } from '../../lib/position'
import { runInitInterval } from '../base'
import { LeafletRule } from '../leaflet'
import './ghzs.scss'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GhzsAny = any
export class GhzsRule extends LeafletRule {
    static rule = ['static-web.ghzs.com']
    vue: GhzsAny
    async init(): Promise<void> {
        this.window.document.body.classList.add('zhiqiong-rule-ghzs')
        await runInitInterval(() => {
            this.vue = (<GhzsAny>this.window.document.querySelector('#map-app'))?.__vue__
            this.map = this.vue.$children[0].mapContainer
            return !!(this.vue && this.map)
        })
        await super.init()
    }
    setPosition(pos: ZQMapPosition) {
        const y = pos.x / 1.49 + 22670
        const x = pos.y / 1.51 + 19950
        const zoomfactor = 2 ** (7 - this.map.getZoom())
        const { lat, lng } = this.map.unproject([x / zoomfactor, y / zoomfactor])
        pos.x = lat
        pos.y = lng
        pos.characterRotation = 0 - pos.characterRotation
        pos.viewportRotation = 0 - pos.viewportRotation
        return super.setPosition(pos)
    }
}
