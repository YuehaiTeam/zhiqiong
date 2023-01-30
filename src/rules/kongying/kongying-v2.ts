/**
 * 酒馆v2已经不再维护，故先不适配
 */
import { Map } from 'leaflet'
import { LeafletRule } from '../leaflet'
const hasCsp = !!(
    document.querySelector('meta[http-equiv=Content-Security-Policy]') ||
    document.querySelector('meta[http-equiv=content-security-Policy]')
)
export class KongyingV2Rule extends LeafletRule {
    static rule = [
        (location: Location) => {
            if (location.host !== 'yuanshen.site') return false
            if (!hasCsp) {
                if (location.pathname === 'zhiqiong-next.dll') {
                    installAntiCSPMode()
                    return true
                }
            }
            return false
        },
    ]
    async findMap(): Promise<Map> {
        return this.window.map
    }
}
function installAntiCSPMode() {
    //
}
