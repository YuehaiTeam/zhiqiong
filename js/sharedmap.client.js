const fr = document.getElementById('mysmap');
function setLoadingText(text) {
    document.getElementById('loading-text').innerHTML = text;
}
window.mapInit = false;
window.mapInitCallback = (map, COCOGOAT_USER_MARKER) => {
    document.querySelector('.map-loading').classList.add('hide');
    mapInit = true;
    ev.off('map');
    ev.on('map', ([lat, lng, dir, rot]) => {
        if (!mapInit) return;
        COCOGOAT_USER_MARKER.setLatLng([lat, lng]);
        COCOGOAT_USER_MARKER._icon.style.setProperty('--dir', 0 - dir + 'deg');
        COCOGOAT_USER_MARKER._icon.style.setProperty('--rot', 0 - rot + 'deg');
    });
};
window.mapLoadCallback = () => {
    setTimeout(() => document.querySelector('.map-loading').classList.add('hide'), 300);
};
let peer, peerId, conn;
const ev = new EventEmitter();
ah.proxy({
    onRequest: (config, handler) => {
        if (
            conn &&
            (config.url.includes('/api-takumi.mihoyo.com') ||
                config.url.includes('/api.mihoyo.com') ||
                config.url.includes('/bbs-api.mihoyo.com'))
        ) {
            // proxy to webrtc
            const id = randkey();
            ev.once(id, (data) => {
                handler.resolve({
                    config,
                    ...data,
                });
                console.log('SharedMap::proxyResponse::' + id);
            });
            conn.send({
                id,
                action: 'xhr',
                data: {
                    url: config.url,
                    method: config.method,
                    body: config.body,
                    headers: config.headers,
                },
            });
            console.log('SharedMap::proxy::' + id, config.url);
        } else if (config.url.includes('webstatic.hoyoverse.com')) {
            config.url = config.url.replace('webstatic.hoyoverse.com', 'webstatic.mihoyo.com');
            handler.next(config);
        } else {
            handler.next(config);
        }
    },
    onError: (err, handler) => {
        handler.next(err);
    },
    onResponse: (response, handler) => {
        handler.next(response);
    },
});
async function connectPeer(shareId, useTurn = false) {
    if (!shareId) return;
    shareId = shareId.substring(0, 9);
    if (shareId.length !== 9) return;
    const remoteId = `cocogoat-shared-map-${shareId}`;
    setLoadingText('寻找用户...');
    conn = await new Promise(async (res, rej) => {
        let turnObj = [];
        if (useTurn) {
            try {
                const p = await fetch('https://77.cocogoat.work/v1/utils/turn');
                if (p.ok) {
                    turnObj = await p.json();
                    console.log(turnObj);
                }
            } catch (e) {}
        }
        peer = new Peer({
            debug: 3,
            config: {
                iceServers: [{ url: 'stun:stun.qq.com:3478' }, { url: 'stun:stun.miwifi.com:3478' }, ...turnObj],
            },
        });
        peer.on('error', (err) => {
            if (err.message.indexOf('Could not connect to peer') === 0) {
                err.message =
                    '连接失败，请确认连接码是否正确。如不清楚如何获取连接码，请安装PC端油猴脚本或悬浮窗后在共享界面扫码连接。';
            }
            swal({
                title: '出错了',
                text: err.message,
                icon: 'error',
            });
            rej(err);
        });
        peer.on('open', (id) => {
            setLoadingText('建立连接...');
            peerId = id;
            const conn = peer.connect(remoteId);
            conn.on('open', () => {
                console.log('connected');
                setLoadingText('等待数据...');
                res(conn);
            });
            // detect iceConnectionState
            conn.peerConnection.addEventListener('iceconnectionstatechange', () => {
                if (conn.peerConnection.iceConnectionState === 'disconnected' && !mapInit) {
                    if (!useTurn) {
                        conn.close();
                        peer.destroy();
                        connectPeer(shareId, true).then((e) => {
                            resolve(false);
                        });
                    } else {
                        swal({
                            title: '连接失败',
                            text: '请检查网络或关闭代理',
                            icon: 'error',
                        });
                        rej(new Error('iceConnectionState disconnected'));
                    }
                }
            });
        });
    });
    conn &&
        conn.on('data', (data) => {
            if (!data.action) return;
            ev.emit(data.id || data.action, data.data);
        });
}
async function loadMap() {
    document.querySelector('.map-loading').classList.remove('hide');
    document.querySelector('.form-main').style.display = 'none';
    const res = await fetch('https://webstatic.mihoyo.com/ys/app/interactive-map/index.html');
    const rest = await res.text();
    const dom = new DOMParser();
    const doc = dom.parseFromString(rest, 'text/html');
    doc.querySelectorAll('script').forEach((e) => {
        if (!e.src || e.src.includes('analysis')) e.remove();
    });
    const scriptEl = document.createElement('script');
    scriptEl.innerHTML = `window.miHoYoAnalysis = {
                install(Vue) {
                    Vue.prototype.$mia = {
                        trackPageview() {},
                        trackEvent() {},
                        updateUid(){}
                    };
                },
            };
            const _URL = URL;
            class ProxyURL extends _URL {
                constructor(a, b) {
                    super(a, b === location.href ? document.querySelector('base').href : b);
                }
            }
            URL = ProxyURL;
            // move XHR to parent
            XMLHttpRequest=parent.XMLHttpRequest;
            `;
    doc.head.appendChild(scriptEl);
    const mapClientUrl = new URL('/js/map.client.js', location.href);
    const mapClientScript = document.createElement('script');
    mapClientScript.src = mapClientUrl.href;
    doc.head.appendChild(mapClientScript);
    fr.srcdoc = doc.documentElement.outerHTML.replace(
        '<title>',
        '<base href="https://webstatic.mihoyo.com/ys/app/interactive-map/" /><title>',
    );
}
function randkey() {
    let k1 = Math.round(
        Number(Date.now().toString().split('').reverse().join('')) + performance.now() * 999 + Math.random() * 1000000,
    )
        .toString(36)
        .toUpperCase();
    let k2 = Math.round(
        Number(Date.now().toString().split('').reverse().join('')) + performance.now() * 999 + Math.random() * 1000000,
    )
        .toString(36)
        .toUpperCase();
    return (k1 + k2).substr(0, 9);
}
