import { ZQMapOverlay } from './overlay'
import { defineStore } from 'pinia'
export const useStore = defineStore('zhiqiong', {
    state: () => ({
        pinned: false,
        matchedOverlays: [] as ZQMapOverlay<unknown>[],
    }),
    getters: {
        connected() {
            return false
        },
        overlays(): ZQMapOverlay<unknown>[] {
            return this.matchedOverlays
        },
    },
})
