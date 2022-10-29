const fr = document.getElementById('mysmap');
function setLoadingText(text) {
    document.getElementById('loading-text').innerHTML = text;
}
window.mapInit = false;
window.site = location.hash.includes('site=') ? location.hash.split('site=')[1].split('&')[0] : '';
let isPinned = true;
const mapUrls = {
    'webstatic.mihoyo.com': 'https://webstatic.mihoyo.com/ys/app/interactive-map/index.html',
    'act.hoyolab.com': 'https://act.hoyolab.com/ys/app/interactive-map/index.html',
    'yuanshen.site': 'https://yuanshen.site/index.html',
};
window.mapInitCallback = (map, COCOGOAT_USER_MARKER) => {
    document.querySelector('.map-loading').classList.add('hide');
    mapInit = true;
    ev.off('map');
    ev.on('map', ([_lat, _lng, _dir, _rot, posobj]) => {
        if (!mapInit) return;
        let { m, x, y, r: rot, a: dir } = posobj;
        const pos = [y, x];
        if (site === 'yuanshen.site') {
            const apos = [];
            apos[0] = (pos[0] + 5890) / 2;
            apos[1] = (pos[1] - 2285) / 2;
            pos.reverse();
            pos[0] = pos[0] / 1.5;
            pos[1] = pos[1] / 1.5;
            COCOGOAT_USER_MARKER.setLatLng(pos);
            COCOGOAT_USER_MARKER._icon.style.setProperty('--dir', 0 - dir + 'deg');
            COCOGOAT_USER_MARKER._icon.style.setProperty('--rot', 0 - rot + 'deg');
            if (isPinned) map.setView(pos);
        } else if (site === 'static-web.ghzs.com') {
            const apos = [];
            apos[0] = (pos[0] + 5890) / 2;
            apos[1] = (pos[1] - 2285) / 2;
            const y = pos[0] / 1.49 + 22670;
            const x = pos[1] / 1.51 + 19950;
            const zoomfactor = 2 ** (7 - $map.map._zoom);
            const unWrappedPos = map.unproject([x / zoomfactor, y / zoomfactor]);
            pos[0] = unWrappedPos.lat;
            pos[1] = unWrappedPos.lng;
            COCOGOAT_USER_MARKER.setLatLng(pos);
            COCOGOAT_USER_MARKER._icon.style.setProperty('--dir', 0 - dir + 'deg');
            COCOGOAT_USER_MARKER._icon.style.setProperty('--rot', 0 - rot + 'deg');
            if (isPinned) map.setView(pos);
        } else {
            pos[0] = (pos[0] + 5890) / 2;
            pos[1] = (pos[1] - 2285) / 2;
            COCOGOAT_USER_MARKER.setLatLng(pos);
            COCOGOAT_USER_MARKER._icon.style.setProperty('--dir', 0 - dir + 'deg');
            COCOGOAT_USER_MARKER._icon.style.setProperty('--rot', 0 - rot + 'deg');
            if (isPinned) map.setView(pos);
        }
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
                config.url.includes('/bbs-api.mihoyo.com') ||
                config.url.includes('hoyoverse.com') ||
                config.url.includes('hoyolab.com') ||
                config.url.includes('yuanshen.site'))
        ) {
            // proxy to webrtc
            const id = randkey();
            ev.once(id, async (data) => {
                if (config.url.includes('/ys_obc/v1/map/info')) {
                    const uri = new URL(config.url);
                    uri.host = 'waf-api-takumi.mihoyo.com';
                    const res = JSON.parse(await ajaxToText(uri.toString()));
                    const orig = JSON.parse(data.response);
                    orig.data.info.detail = res.data.info.detail;
                    data.response = JSON.stringify(orig);
                    console.log('SharedMap::replaceResources::mapInfo', uri.search);
                }
                if (config.url.includes('/ys_obc/v1/map/label/tree')) {
                    const uri = new URL(config.url);
                    uri.host = 'waf-api-takumi.mihoyo.com';
                    const res = JSON.parse(await ajaxToText(uri.toString()));
                    const orig = JSON.parse(data.response);
                    for (const item of orig.data.tree) {
                        const cn = res.data.tree.find((i) => i.id === item.id);
                        for (const child of item.children) {
                            try {
                                const cnchild = cn.children.find((i) => i.id === child.id);
                                child.icon = cnchild.icon;
                            } catch (e) {
                                child.icon = '';
                            }
                        }
                    }
                    data.response = JSON.stringify(orig);
                    console.log('SharedMap::replaceResources::labelTree', uri.search);
                }
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
            host: '77.xyget.cn',
            port: 443,
            path: '/ashaka',
            secure: true,
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
function ajaxToText(url) {
    const xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
        xhr.open('GET', url);
        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    });
}
async function loadMap() {
    if (!site) {
        await new Promise((resolve) => {
            ev.once('map', ([_lat, _lng, _dir, _rot, _posobj, usite]) => {
                site = usite;
                resolve();
            });
        });
    }
    document.querySelector('.map-loading').classList.remove('hide');
    document.querySelector('.form-main').style.display = 'none';
    const mapUrl = mapUrls[site] || mapUrls['webstatic.mihoyo.com'];
    const rest = await ajaxToText(mapUrl);
    const dom = new DOMParser();
    const doc = dom.parseFromString(rest, 'text/html');
    let fetchBundle = '';
    doc.querySelectorAll('script').forEach((e) => {
        if (site !== 'yuanshen.site' && (!e.src || e.src.includes('analysis'))) e.remove();
        if (e.src.includes('bundle_') && site == 'act.hoyolab.com') {
            fetchBundle = new URL(e.src.replace(location.origin + '/', ''), mapUrl).href;
            e.removeAttribute('src');
            e.id = 'bundle';
        }
    });
    if (fetchBundle) {
        console.log('SharedMap::fetchBundle', fetchBundle);
        let bundle = await ajaxToText(fetchBundle);
        bundle = bundle
            .replace(
                'webstatic.hoyoverse.com/upload/static-resource/2022/01/27/6689b7e94cc39dce1630d063a5fb438c_3648041335640656431.png',
                'webstatic.mihoyo.com/upload/static-resource/2022/01/27/6689b7e94cc39dce1630d063a5fb438c_3568232263172078079.png',
            )
            .replace(
                'webstatic.hoyoverse.com/upload/static-resource/2022/01/27/5a143f70a34126c816c857b04eac79c1_2557671995584636726.png',
                'webstatic.mihoyo.com/upload/static-resource/2022/01/27/5a143f70a34126c816c857b04eac79c1_398628676394898442.png',
            )
            .replace(
                'webstatic.hoyoverse.com/upload/static-resource/2022/01/27/751b7d707eba925a8caa24d5b48300ae_3084135939255681980.png',
                'webstatic.mihoyo.com/upload/static-resource/2022/01/27/751b7d707eba925a8caa24d5b48300ae_4405543606187624254.png',
            )
            .replace(
                'webstatic.hoyoverse.com/upload/static-resource/2022/01/27/bb4d956a2e14e03a9e7358b5e1f07691_6147235523146565799.png',
                'webstatic.mihoyo.com/upload/static-resource/2022/01/27/bb4d956a2e14e03a9e7358b5e1f07691_209494575327196419.png',
            )
            .replace(
                'webstatic.hoyoverse.com/upload/static-resource/2022/01/27/6cb7603c4fc3a043efe759713afbe456_543711165073740768.png',
                'webstatic.mihoyo.com/upload/static-resource/2022/01/27/6cb7603c4fc3a043efe759713afbe456_4132564267053308662.png',
            )
            .replace(
                'webstatic.hoyoverse.com/upload/static-resource/2022/08/12/bec5be91e59aeb1980e32b74a49f5a43_8067231519259424466.png',
                'webstatic.mihoyo.com/upload/static-resource/2022/08/12/bec5be91e59aeb1980e32b74a49f5a43_9188200353519104610.png',
            )
            .replace(
                'webstatic.hoyoverse.com/upload/static-resource/2022/08/12/17f5d22dd03fd34ef5d962229812a829_5665110887580382107.png',
                'webstatic.mihoyo.com/upload/static-resource/2022/08/12/17f5d22dd03fd34ef5d962229812a829_7711746215989667714.png',
            )
            .replace(
                'webstatic.hoyoverse.com/upload/static-resource/2022/08/22/c6ef08e67cc8fb03124f0c59a1c0e599_5981257958716273219.png',
                'webstatic.mihoyo.com/upload/static-resource/2022/08/22/c6ef08e67cc8fb03124f0c59a1c0e599_7926001958379296383.png',
            )
            .replace(
                'webstatic.hoyoverse.com/upload/static-resource/2022/08/22/0761bf0755d45eaa214592b20a85bd77_2676775578290282633.png',
                'webstatic.mihoyo.com/upload/static-resource/2022/08/22/0761bf0755d45eaa214592b20a85bd77_8042363951001241375.png',
            )
            .replace(
                'webstatic.hoyoverse.com/upload/static-resource/2022/03/14/68cd43c5d003ddac48af837e9a59fe1a_640570976704995679.jpg',
                'webstatic.mihoyo.com/upload/static-resource/2022/03/14/68cd43c5d003ddac48af837e9a59fe1a_1605545427899974301.jpg',
            )
            .replace(
                'webstatic.hoyoverse.com/upload/static-resource/2022/03/29/44aa9115cb2caeb613a17e3b26d20835_3943405138303651008.gif',
                'webstatic.mihoyo.com/upload/static-resource/2022/03/29/44aa9115cb2caeb613a17e3b26d20835_3392398234619449434.gif',
            )
            .replace(
                'webstatic.hoyoverse.com/upload/static-resource/2022/05/05/931ab457c0878bb3b2a032ff4f6fcd5f_2886979144522866270.png',
                'webstatic.mihoyo.com/upload/static-resource/2022/03/01/03360ade9c9abd959f70cb22745d6a19_5487892317922237704.png',
            )
            .replace(
                'webstatic.hoyoverse.com/upload/static-resource/2022/05/05/03360ade9c9abd959f70cb22745d6a19_2219353174590990430.png',
                'webstatic.mihoyo.com/upload/static-resource/2022/02/28/931ab457c0878bb3b2a032ff4f6fcd5f_2998577117315966701.png',
            )
            .replace(
                'webstatic.hoyoverse.com/upload/static-resource/2022/07/01/931b1b71a375193d63e1d2699ba6f7e3_3924472684993707780.png',
                'webstatic.mihoyo.com/upload/static-resource/2022/07/01/931b1b71a375193d63e1d2699ba6f7e3_8080878370830465910.png',
            )
            .replace(
                'webstatic.hoyoverse.com/upload/static-resource/2022/08/10/3f8aee384c305edfa6819c5107942b04_8396523823798894435.png',
                'webstatic.mihoyo.com/upload/static-resource/2022/08/10/3f8aee384c305edfa6819c5107942b04_3778762597972131129.png',
            );
        doc.getElementById('bundle').innerHTML = bundle;
    }
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
                    try{
                    }catch(e){}
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
    let srcdoc = doc.documentElement.outerHTML.replace('<title>', `<base href="${mapUrl}" /><title>`);
    if (site === 'yuanshen.site') {
        srcdoc = srcdoc
            .replace('Security-Policy', '')
            .replace('security-policy', '')
            .replace('<body>', '<body class="zhiqiong-normal">');
    }
    fr.srcdoc = srcdoc;
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
