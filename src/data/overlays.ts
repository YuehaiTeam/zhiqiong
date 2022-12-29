import { ZQMapOverlay } from './../lib/overlay'
/**
 * Overlay Config
 * @description 配置地图叠加层
 */
export default [
    {
        name: '米游社 - 须弥 - 沙漠地下',
        image: 'https://upload-bbs.mihoyo.com/upload/2022/10/29/300350281/4b5f2f9a5186d4c27d52910a39211b7f_2427272594906556713.png',
        position: [6420, -6890],
        resolution: 3072,
        rule: ['webstatic.mihoyo.com', 'act.hoyolab.com'],
    },
    {
        name: '米游社 - 须弥 - 森林地下',
        image: 'https://upload-bbs.mihoyo.com/upload/2022/10/29/300350281/e316346f4572c7d7e8778e71eabe95e0_6486682272623226706.png',
        position: [4515, -5350],
        resolution: 3072,
        rule: ['webstatic.mihoyo.com', 'act.hoyolab.com'],
    },
] as ZQMapOverlay<unknown>[]
