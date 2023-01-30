import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import monkey, { cdn } from 'vite-plugin-monkey'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pkgjson from './package.json'
// https://vitejs.dev/config/
export default defineConfig((ctx) => {
    const env = loadEnv(ctx.mode, '.')
    const clver = (env.VITE_FROSTFLAKE_MIN_VERSION as string).split('.').map((v) => parseInt(v, 10))
    const jsver = (pkgjson.version as string).split('.').map((v) => parseInt(v, 10))
    const gfver = [clver[0], clver[1], jsver[0], jsver[1]].join('.') + '-r' + jsver[2]
    return {
        plugins: [
            vue(),
            monkey({
                entry: 'src/main.ts',
                userscript: {
                    name: '志琼·原神地图',
                    version: gfver,
                    author: 'YuehaiTeam',
                    icon: 'https://webstatic.mihoyo.com/ys/app/interactive-map/mapicon.png',
                    namespace: 'yuehaiteam/zhiqiong-next',
                    match: [
                        'https://cocogoat.work/*',
                        'https://webstatic.mihoyo.com/ys/app/interactive-map/*',
                        'https://act.hoyolab.com/ys/app/interactive-map/*',
                        'https://v3.yuanshen.site/*',
                        'https://static-web.ghzs.com/cspage_pro/yuanshenMap*',
                    ],
                    grant: ['unsafeWindow'],
                },
                build: {
                    externalGlobals: {
                        vue: cdn.baomitu('Vue', 'dist/vue.global.prod.js'),
                        vant: cdn.baomitu('vant', 'vant.min.js'),
                        eventemitter3: cdn.baomitu('eventemitter3', 'index.min.js'),
                    },
                    externalResource: {
                        'vant/lib/index.css': cdn.baomitu('vant', 'vant.min.css'),
                    },
                },
            }),
        ],
    }
})
