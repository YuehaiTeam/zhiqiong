let COCOGOAT_USER_MARKER;
(() => {
    const site = parent.site;

    let vue, main, map;
    const uWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const load = () => {
        console.log('map:client:load', site);
        insertStyle();
        parent.mapLoadCallback();
        const runInitInterval = (cb) => {
            if (cb()) return;
            let initInterval = setInterval(() => {
                if (!cb()) return;
                clearInterval(initInterval);
            }, 500);
        };
        if (site === 'yuanshen.site') {
            runInitInterval(() => {
                map = window.map;
                if (!map) return false;
                if (typearray && typearray[0][1].features.length <= 0) return false;
                init();
                InitMarkerLayer();
                return true;
            });
        } else {
            runInitInterval(() => {
                vue = document.querySelector('#root')?.__vue__;
                main = vue?.$children[0];
                map = main?.$children[0]?.$children[0]?.map || main?.$children[0]?.map || main?.$children[1]?.map;
                if (!vue || !main || !map) return;
                init();
                clearInterval(initInterval);
                return true;
            });
        }
    };
    if (document.readyState === 'complete') load();
    uWindow.addEventListener('load', load);
    const init = () => {
        console.log('map:client:init');
        try {
            injectHtml();
        } catch (e) {}
        drawUserIcon();
        parent.mapInitCallback(map, COCOGOAT_USER_MARKER);
    };
    const insertStyle = () => {
        const style = document.createElement('style');
        style.innerHTML = `
    .cocogoat-user-position{
        background:transparent no-repeat center;
        background-size:contain;
        z-index: 10001 !important;
        transition:all .2s;
        --dir:0deg;
        --rot:0deg;
    }
    .cocogoat-user-position:before{
        content:" ";
        display:block;
        width:48px;
        height:48px;
        margin:-24px;
        background:transparent no-repeat center;
        background-size:contain;
        background-image:url(data:image/png;base64,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);
        position: relative;
        z-index: 3;
        transform:rotate(var(--dir));
        transform-origin: center;
        transition: transform .2s;
    }
    .cocogoat-user-position:after{
        content:" ";
        display:block;
        position: relative;
        background:transparent no-repeat center;
        background-size:contain;
        background-image:url('data:image/png;base64,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');
        width: 133px;
        height: 97px;
        margin-top: -115px;
        margin-left: -66px;
        opacity: .8;
        z-index: 2;
        transform:rotate(var(--rot));
        transform-origin: bottom center;
        transition: transform .2s;
    }
    .filter-panel {
        position: fixed;
        left: 0;
        top: 0;
        width: 4.15rem;
        height: 100vh;
        padding: .2rem;
        max-width: 90vw;
        z-index: 99999;
    }
    .filter-panel__fold {
        display: block !important;
    }
    .route-list.route-list--mobile-detail {
        border-top-right-radius: 0;
    }
    .cocogoat-actions {
        position: absolute;
        bottom: 20px;
        left: 20px;
        z-index:99999999;
        margin-bottom: -10px;
    }
    
    .cocogoat-actions svg {
        width: 80%;
        fill: #ece5d8;
    }
    
    .cocogoat-actions .cocogoat-pin {
        display:none;
    }
    
    .cocogoat-actions .cocogoat-share {
        display:none;
        position:relative;
    }
    
    .cocogoat-activated .cocogoat-actions .cocogoat-pin {
        display:flex;
    }
    
    .cocogoat-activated .cocogoat-actions .cocogoat-more {
        display:none;
    }
    
    .cocogoat-activated .cocogoat-actions .cocogoat-share {
        display:flex;
    }
    
    .cocogoat-actions .cocogoat-share-dot {
        display:none;
        position: absolute;
        background: #ff9605;
        color: #fff;
        padding: 1px 4px;
        font-size: 12px;
        border-radius: 3px;
        top: -6px;
        right: -6px;
    }
    .cocogoat-actions .cocogoat-active .cocogoat-share-dot {
        display:block;
    }
    
    .cocogoat-actions .cocogoat-active svg {
        fill:#ffc107;
    }
    
    .cocogoat-dialog .updatelog {
        height: 2rem;
    }
    
    .cocogoat-dialog {
        display: none;
    }
    .cocogoat-dialog .updatelog__content-text {
        height: 100% !important;
        width: 100% !important;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .cocogoat-dialog .updatelog__close {
        display: none;
    }
    
    .cocogoat-dialog .progress {
        width: 80%;
        height: 8px;
        margin: 0 auto;
        border: 1px solid #c5b189;
        border-radius: 8px;
        margin-top: 10px;
        display:none;
    }
    
    .updatelog__content-text>div {
        width: 100%;
        text-align: center;
    }
    
    .cocogoat-dialog .progress-in {
        height: 100%;
        display: block;
        background: #c4b188;
        width: .1%;
        transition: all .2s;
    }
    .cocogoat-dialog .share-qr {
        height: 1rem;
        width: 1rem;
        box-sizing: content-box;
        padding-left: 5px;
        padding-right: 10px;
        float: left;
    }
    .cocogoat-dialog .share-qr img {
        height: 100%;
        width: 100%;
        mix-blend-mode: multiply;
    }
    .cocogoat-dialog .share-text {
        line-height: 1.3;
        font-size:13px;
        padding-top:15px;
    }
    .cocogoat-dialog code {
        font-family: Consolas,monospace;
        color: #860000;
        font-weight: bold;
        padding: 2px 5px;
        background: #fbf9f4;
        border-radius: 3px;
        margin-left: 10px;
        user-select:all;
    }
    .mhy-bbs-app-header {
        display: none;
    }
    .bbs-qr {
        display: none !important;
    }
    .container .updatelog {display: none !important;}
    .container .updatelog__mask {display: none;}
    /* yuanshen.site */
    .zhiqiong-normal .danjixiazai,
    .zhiqiong-normal .enindex-btn,
    .zhiqiong-normal .jpindex-btn,
    .zhiqiong-normal .fankui,
    .zhiqiong-normal .genshin_pub,
    .zhiqiong-normal .genshin_art,
    .zhiqiong-normal .feixiaoqiu,
    .zhiqiong-normal .wiki{
        display: none!important;
    }
    
    @media screen and (max-height:700px){
        .control-containor {
            zoom: .8;
        }
        .switch_BG {
            display:none;
        }
        footer.footer {
            zoom: .8;
            width: 100%;
        }
    }
    @media screen and (max-height:500px){
        .control-containor {
            zoom: .7;
        }
    }
    
    .switch_content {
        zoom: .8;
        margin-left: 50px;
        margin-bottom: -10px;
    }
    
    .yuanshen-site .cocogoat-actions {
        left: 7px;
        bottom: 37px;
    }
    
    .switch_content .switch {
        background-size: 45% 100%;
    }
    
    .switch_text {
        margin-left: 52px;
        border-radius: 5px;
        padding: 0 5px;
    }
    /* ghzs.com */
    .fixmodel.bottom,.gonggao.visi-div,.share.visi-div,.fixmodel.posi-left.top-left1 {
        display: none;
    }
    .static-web-ghzs-com .cocogoat-actions {
        bottom: 68px;
        margin-left: -16px;
        right: -44px;
        left: auto;
    }
    .static-web-ghzs-com .cocogoat-actions .mhy-map__action-btn {
        background-color: rgba(29,40,57,0.8);
        box-sizing: border-box;
        border: 0.01rem solid rgba(255,255,255,0.05);
        border-radius: 0.08rem;
    }
    .filter-btn.visi-div {
        width: 40px !important;
        margin-right: -12px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .filter-popup .visi-div::after {
        border-radius: 0 !important;
    }
    
    @media screen and (max-width:450px){
        .filter-popup {
            zoom: .8;
        }
        .static-web-ghzs-com .cocogoat-dialog {
            zoom: 1.25;
        }
        .fixmodel.posi-left.top-left {
            display: none;
        }
        .area-item {
            height: .95rem !important;
        }
    }
    @media screen and (max-height:450px){
        .filter-popup {
            zoom: .8;
        }
        .static-web-ghzs-com .cocogoat-dialog {
            zoom: 1.25;
        }
        .fixmodel.posi-left.top-left {
            display: none;
        }
        .area-item {
            height: .95rem !important;
        }
    }
    @media screen and (max-height:840px){
        .areafixmodel-container.areafixmodel {
            top: 128px !important;
        }
        .zone-btn {
            display: none;
        }
        .fixmodel.top {
            top: 0 !important;
            right: 0 !important;
        }
        .area-item {
            height: .95rem !important;
        }
        .map-btn.visi-box {
            margin-right: 0;
            border-radius: 0;
            border: 0;
        }
    }
.mhy-bbs-app-header {
    display: none !important;
}
`;
        document.head.appendChild(style);
    };

    const dialogAlert = (title, content, closable = false) => {
        document.querySelector('.cocogoat-dialog .updatelog__title').innerText = title;
        document.querySelector('.cocogoat-dialog .text').innerHTML = content;
        document.querySelector('.cocogoat-dialog').style.display = 'block';
        document.querySelector('.cocogoat-dialog .updatelog__close').style.display = closable ? 'block' : 'none';
    };
    const dialogClose = () => {
        document.querySelector('.cocogoat-dialog').style.display = 'none';
    };
    const injectHtml = () => {
        const root = document.createElement('div');
        root.id = 'cocogoat-root';
        const p1 = new DOMParser();
        const uldom = p1.parseFromString(document.querySelector('.updatelog').parentElement.innerHTML, 'text/html');
        uldom.querySelectorAll('p').forEach((e) => e.remove());
        root.innerHTML = `
    <!--div class="mhy-map__action-btn cocogoat-more">
        <svg viewBox="0 0 204 204" class="v-icon cocogoat"><g><path d=" M 92.79 59.13 C 94.98 55.32 98.53 52.56 101.92 49.88 C 105.14 52.74 108.92 55.30 111.02 59.15 C 110.63 62.49 107.80 65.92 104.21 65.83 C 101.15 65.86 97.27 66.68 95.10 63.91 C 93.97 62.56 92.73 60.98 92.79 59.13 Z"></path><path d=" M 82.38 54.26 C 82.72 54.23 83.41 54.17 83.76 54.14 C 86.77 57.18 89.10 60.84 92.29 63.72 C 93.95 65.58 96.89 67.68 95.57 70.52 C 93.68 75.27 90.04 79.03 87.26 83.27 C 85.94 84.91 84.25 87.99 81.72 86.52 C 79.39 83.07 77.68 79.20 75.02 75.95 C 73.64 73.84 70.87 71.42 72.69 68.75 C 75.49 63.69 78.35 58.47 82.38 54.26 Z"></path><path d=" M 119.11 54.95 C 120.87 52.96 122.79 55.72 123.89 57.04 C 126.97 61.41 130.22 65.85 132.00 70.92 C 128.93 76.45 124.76 81.37 121.83 87.03 C 121.20 86.96 119.95 86.83 119.33 86.77 C 116.16 82.55 113.06 78.28 110.00 73.99 C 108.50 71.78 106.78 68.39 109.16 66.15 C 112.65 62.58 116.01 58.89 119.11 54.95 Z"></path><path d=" M 51.82 63.56 C 58.70 63.02 64.12 67.97 68.08 72.99 C 72.28 77.62 75.21 83.19 78.32 88.57 C 80.70 92.48 79.50 97.42 81.68 101.44 C 84.44 88.13 95.06 78.87 101.41 67.39 C 103.21 69.06 104.59 71.10 105.93 73.15 C 111.83 81.55 119.56 89.46 121.42 99.94 C 121.88 99.79 122.79 99.50 123.25 99.35 C 123.62 95.93 123.59 92.31 125.30 89.22 C 129.75 80.82 134.83 72.41 142.47 66.52 C 145.21 64.40 148.62 63.50 152.06 63.57 C 150.18 68.18 148.61 72.98 148.91 78.04 C 148.87 91.80 143.22 105.66 132.73 114.74 C 129.22 118.10 124.49 120.51 122.54 125.21 C 127.83 124.55 132.04 121.10 136.38 118.32 C 145.39 112.57 154.03 106.14 161.79 98.78 C 167.77 93.07 171.20 85.51 174.16 77.96 C 176.45 77.74 177.07 80.44 178.09 81.97 C 181.72 88.26 181.50 95.83 180.67 102.81 C 179.03 109.41 175.27 115.68 169.55 119.51 C 161.87 124.32 153.00 127.10 143.98 127.83 C 140.96 128.00 137.94 128.52 135.19 129.85 C 136.01 134.37 136.26 139.44 133.24 143.26 C 129.03 150.23 118.48 151.96 112.25 146.74 C 108.03 143.08 106.71 137.40 103.80 132.82 C 102.28 133.14 100.11 132.48 99.28 134.22 C 96.79 138.38 95.66 143.53 91.73 146.71 C 87.38 150.49 80.82 150.55 75.80 148.14 C 72.69 146.31 70.33 143.26 68.96 139.95 C 67.64 136.66 68.75 133.04 68.04 129.67 C 65.75 128.01 62.69 128.23 60.02 127.83 C 51.21 127.21 42.64 124.39 35.05 119.91 C 28.95 116.19 24.96 109.66 23.29 102.82 C 22.58 95.83 22.21 88.24 25.83 81.92 C 26.84 80.41 27.51 77.79 29.76 77.99 C 31.70 81.87 32.72 86.19 35.15 89.83 C 41.41 100.09 51.57 106.93 61.00 113.98 C 67.60 117.93 73.49 123.71 81.26 125.19 C 79.42 120.47 74.79 118.01 71.24 114.75 C 60.50 105.43 54.82 91.11 55.06 76.99 C 55.35 72.26 53.43 67.89 51.82 63.56 M 72.72 129.22 C 72.52 135.00 78.56 138.93 83.85 138.62 C 87.70 138.20 90.56 135.35 93.11 132.70 C 87.27 128.33 79.61 128.62 72.72 129.22 M 110.90 132.29 C 112.59 134.55 114.51 136.81 117.21 137.86 C 123.13 140.54 131.06 135.91 131.17 129.27 C 124.29 128.39 117.05 128.76 110.90 132.29 Z"></path></g></svg>
    </div-->
    <div class="cocogoat-dialog">
        ${uldom.body.innerHTML}
    </div>
    
`;
        document.querySelector('.mhy-game-gis').appendChild(root);
        document.querySelector('.cocogoat-dialog .updatelog__content-text').innerHTML = `
    <div>
    <div class="text">处理中</div>
    <div class="progress">
    <div class="progress-in"></div>
    </div>
    </div>
`;
    };
    const drawUserIcon = () => {
        const COCOGOAT_USER_ICON = L.divIcon({
            iconSize: [1, 1],
            alt: '',
            className: 'cocogoat-user-position',
        });
        COCOGOAT_USER_MARKER = L.marker([0, 0], { icon: COCOGOAT_USER_ICON }).addTo(map);
        try {
            COCOGOAT_USER_MARKER.setRotationOrigin('center');
        } catch (e) {}
    };
})();