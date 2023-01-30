import { WsInvokeResponse } from './webcontrol'
import { unsafeWindow } from '$'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const XHR = new (unsafeWindow as any).XMLHttpRequest() as typeof XMLHttpRequest
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WS = new (unsafeWindow as any).WebSocket() as typeof WebSocket
export const signedLaunch = async (token: string) => {
    if (/zhiqiong-uwp/.test(navigator.userAgent)) {
        try {
            unsafeWindow.chrome.webview.postMessage({ action: 'PLUGIN', token })
            await new Promise((resolve) => {
                setTimeout(resolve, 2000)
            })
        } catch (e) {}
    } else {
        const launchBase = 'cocogoat-control://launch'
        const signapiBase = 'https://77.cocogoat.work/v2/frostflake/sign'
        const launchParams = `?register-token=${token}&register-origin=${location.origin}`
        let launchUrl = `${launchBase}${launchParams}`
        try {
            // remote-sign launch url
            const res = await getWithTimeout<{ url: string }>(signapiBase + launchParams, 2000)
            if (res.status === 201 && res.body && res.body.url) {
                launchUrl = res.body.url
            }
        } catch (e) {}
        // open url scheme in iframe
        const iframe = document.createElement('iframe')
        iframe.src = launchUrl
        iframe.style.display = 'none'
        document.body.appendChild(iframe)
        await new Promise((resolve) => {
            setTimeout(resolve, 2000)
        })
        document.body.removeChild(iframe)
    }
}
const getWithTimeout = async function <T>(url: string, timeout: number): Promise<WsInvokeResponse<T>> {
    return new Promise((resolve, reject) => {
        const xhr = new XHR()
        xhr.timeout = timeout
        xhr.open('GET', url)
        xhr.send()
        xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 201) {
                resolve({
                    status: xhr.status,
                    body: JSON.parse(xhr.responseText),
                })
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
