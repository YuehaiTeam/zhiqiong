export enum ZQMapId {
    TEAVAT,
    ENKANOMIYA,
    CHASM,
}
export interface ZQPositionError {
    code: number
    message: string
}
export interface ZQMapPosition {
    mapId: ZQMapId
    x: number
    y: number
    characterRotation: number
    viewportRotation: number
    err: number
    errors: ZQPositionError[]
}
