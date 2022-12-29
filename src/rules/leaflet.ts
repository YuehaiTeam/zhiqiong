import { ZQMapPosition } from './../lib/position'
import { useStore } from './../lib/store'
import type L from 'leaflet'
import { ZQMapOverlay } from '../lib/overlay'
import { BaseRule } from './base'
import './leaflet.scss'

export abstract class LeafletRule extends BaseRule {
    L!: typeof L
    map!: L.Map
    icon!: L.DivIcon
    marker!: L.Marker
    overlay!: L.LayerGroup
    dom!: HTMLDivElement
    icondom!: HTMLDivElement
    async findMap(): Promise<L.Map> {
        if (!this.map) throw new Error('Map not found')
        return this.map
    }
    async findLeaflet(): Promise<typeof L> {
        return this.window.L
    }
    async init(): Promise<void> {
        this.window.document.body.classList.add('zhiqiong-rule-leaflet')
        const store = useStore()
        const overlays = store.overlays as ZQMapOverlay<unknown>[]
        ;[this.L, this.map] = await Promise.all([this.findLeaflet(), this.findMap()])
        const L = this.L
        const map = this.map
        this.icon = L.divIcon({
            iconSize: [1, 1],
            className: 'zhiqiong-user-position',
        })
        this.marker = L.marker([0, 0], { icon: this.icon }).addTo(map)
        this.overlay = L.layerGroup([])
        this.dom = map.getContainer() as HTMLDivElement
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.icondom = (<any>this.marker)._icon as HTMLDivElement
        overlays.forEach((item) => {
            new Image().src = item.image
            L.imageOverlay(
                item.image,
                L.latLngBounds([
                    item.position,
                    [item.position[0] - item.resolution, item.position[1] + item.resolution],
                ]),
                {
                    opacity: 1,
                    interactive: false,
                },
            ).addTo(this.overlay)
        })
        let tmpDragging = -1
        let tmpMousePos = [0, 0]
        map.addEventListener('mousedown', (e) => {
            if (!store.connected) return
            tmpDragging = Date.now()
            tmpMousePos = [e.originalEvent.clientX, e.originalEvent.clientY]
        })
        this.dom.addEventListener('touchstart', (e) => {
            tmpDragging = Date.now()
            tmpMousePos = [e.touches[0].clientX, e.touches[0].clientY]
        })
        map.addEventListener('mouseup', () => {
            if (!store.connected) return
            tmpDragging = -1
        })
        this.dom.addEventListener('touchend', () => {
            tmpDragging = -1
        })
        map.addEventListener('mousemove', (e) => {
            if (tmpDragging > 0 && Date.now() - tmpDragging > 100) {
                const nowMousePos = [e.originalEvent.clientX, e.originalEvent.clientY]
                const diff = [Math.abs(nowMousePos[0] - tmpMousePos[0]), Math.abs(nowMousePos[1] - tmpMousePos[1])]
                if (diff[0] > 20 || diff[1] > 20) store.pinned = false
            }
        })
        this.dom.addEventListener('touchmove', (e) => {
            if (tmpDragging > 0 && Date.now() - tmpDragging > 100) {
                // check pos
                const nowMousePos = [e.touches[0].clientX, e.touches[0].clientY]
                const diff = [Math.abs(nowMousePos[0] - tmpMousePos[0]), Math.abs(nowMousePos[1] - tmpMousePos[1])]
                if (diff[0] > 20 || diff[1] > 20) store.pinned = false
            }
        })
    }
    setOverlay(enable: boolean) {
        if (enable) {
            if (!this.map.hasLayer(this.overlay)) {
                this.map.addLayer(this.overlay)
            }
        } else {
            if (this.map.hasLayer(this.overlay)) {
                this.map.removeLayer(this.overlay)
            }
        }
    }
    setPosition(pos: ZQMapPosition) {
        this.marker.setLatLng([pos.x, pos.y])
        this.icondom.style.setProperty('--dir', 0 - pos.viewportRotation + 'deg')
        this.icondom.style.setProperty('--rot', 0 - pos.characterRotation + 'deg')
        const store = useStore()
        if (store.pinned) this.map.setView([pos.x, pos.y])
    }
}
