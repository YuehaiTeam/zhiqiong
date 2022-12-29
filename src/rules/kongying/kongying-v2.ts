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
    findMap(): Promise<Map> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (<any>this.window).map
    }
}
function installAntiCSPMode() {
    //
}
