const IS_WEIXIN = navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1
/**
 * Ajax Hook Config
 * @description 用于拦截、直接返回或缓存请求
 */
export default {
    cache: [
        {
            url: 'https://bbs-api.mihoyo.com/user/wapi/getUserFullInfo',
            prefix: true,
        },
        {
            url: 'https://passport-api-v4.mihoyo.com/account/ma-cn-session/web/verifyLtoken',
            prefix: true,
        },
        {
            url: 'https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookieToken',
            prefix: true,
        },
        {
            url: 'https://api-takumi.mihoyo.com/common/map_user/ys_obc/v1/map/spot_kind/get_spot_kinds',
            prefix: false,
        },
        {
            url: 'https://waf-api-takumi.mihoyo.com/common/map_user/ys_obc/v1/map/label/tree',
            prefix: false,
        },
        {
            url: 'https://waf-api-takumi.mihoyo.com/common/map_user/ys_obc/v1/map/game_item',
            prefix: false,
        },
        {
            url: 'https://waf-api-takumi.mihoyo.com/common/map_user/ys_obc/v1/map/get_public_notice',
            prefix: false,
        },
        {
            url: 'https://waf-api-takumi.mihoyo.com/common/map_user/ys_obc/v1/map/get_guide',
            prefix: false,
        },
        {
            url: 'https://waf-api-takumi.mihoyo.com/common/map_user/ys_obc/v1/map/get_feedback',
            prefix: false,
        },
        {
            url: 'https://api-takumi.mihoyo.com/common/map_user/ys_obc/v1/map/point/mark_map_point_list',
            prefix: false,
        },
        {
            url: 'https://waf-api-takumi.mihoyo.com/common/map_user/ys_obc/v1/map/point/list',
            prefix: false,
        },
    ],
    direct: [
        ...(IS_WEIXIN
            ? []
            : [
                  {
                      url: 'https://api.mihoyo.com/weixin_api/get/signature',
                      response: {
                          status: 200,
                          headers: {
                              'Content-Type': 'application/json',
                          },
                          response: JSON.stringify({
                              retcode: 0,
                              message: 'succ',
                              data: {
                                  timestamp: Date.now(),
                                  noncestr: '',
                                  signature: '',
                              },
                          }),
                      },
                  },
              ]),
    ],
}
