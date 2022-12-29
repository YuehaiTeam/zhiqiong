import { RuleItem } from './ruleMatcher'
export interface ZQMapOverlay<T> {
    name: string
    image: string
    position: [number, number]
    resolution: number
    rule: RuleItem[]
    data: T
}
