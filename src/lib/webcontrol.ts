import { uuid } from './uuid'
import { WS, XHR } from './api'
import { EventEmitter } from 'eventemitter3'
export interface WsInvokeResponse<T> {
    status: number
    body: T
}
export class CocogoatWebControl {
    host = 'localhost'
    post = 32333
    token = uuid()
    ws: WebSocket | null = null
    ev = new EventEmitter()
    constructor(port?: number) {
        if (port) this.post = port
    }
    ping() {
        return new Promise((resolve, reject) => {
            const xhr = new XHR()
            xhr.timeout = 1500
            xhr.open('GET', `http://${this.host}:${this.post}/`)
            xhr.send()
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText))
                } else {
                    reject(new Error(xhr.statusText))
                }
            }
            xhr.onerror = (e) => {
                reject(e)
            }
            xhr.ontimeout = () => {
                reject(new Error('timeout'))
            }
        })
    }
    async authorize() {
        if (this.ws) return
        let res: Response
        try {
            res = await fetch(`http://${this.host}:${this.post}/token`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + this.token,
                },
            })
        } catch (e) {
            return 'NETWORK'
        }
        if (!res.ok) return 'DENIED'
        const data = await res.json()
        this.token = data.token
        const ws = new WS(`ws://${this.host}:${this.post}/ws/${this.token}`)
        ws.onclose = () => {
            this.ws = null
            this.ev.emit('close')
        }
        ws.onmessage = (e) => {
            const data = JSON.parse(e.data)
            this.ev.emit(data.id || data.action, data.data)
        }
        await new Promise<void>((resolve, reject) => {
            ws.onopen = () => {
                ws.onerror = null
                this.ev.emit('open')
                resolve()
            }
            ws.onerror = reject
        })
        this.ws = ws
        return true
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wsInvoke<E>(action: string, ...data: any[]): Promise<WsInvokeResponse<E>> {
        const body = { action, version: 7, data }
        if (!this.ws) throw new Error('WebSocket not connected')
        const id = Math.round(Date.now() * 1000 + Math.random() * 1000).toString(16)
        const reqjson = {
            id,
            action: 'api',
            data: {
                url: '/api/cvautotrack',
                method: 'POST',
                body: JSON.stringify(body),
            },
        }
        const resp = new Promise((resolve) => {
            console.log('wsInvoke ' + action + ' ' + id)
            this.ev.on(id, resolve)
        })
        this.ws.send(JSON.stringify(reqjson))
        return resp as Promise<WsInvokeResponse<E>>
    }
    async debugCapture() {
        const res = await this.wsInvoke<{
            data: string
        }>('DebugCaptureRes')
        if (res.body.data) {
            return res.body.data
        } else {
            throw new Error(JSON.stringify(res.body))
        }
    }
}
