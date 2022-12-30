import { GM } from '$'
import { reactive, watch } from 'vue'
const createEmptyOptions = () => {
    return {
        enableAjaxHook: false,
    }
}
export type ZhiqiongGlobalOptions = ReturnType<typeof createEmptyOptions>
export const getOrCreateOptions = async (): Promise<ZhiqiongGlobalOptions> => {
    const opt = await GM.getValue('zhiqiong_options', '{}')
    try {
        const json = JSON.parse(opt)
        return Object.assign(createEmptyOptions(), json)
    } catch (e) {
        return createEmptyOptions()
    }
}
export const getSyncOptions = async () => {
    const opt = reactive(await getOrCreateOptions())
    watch(opt, (val) => {
        GM.setValue('zhiqiong_options', JSON.stringify(val))
    })
    return opt
}

export const createStatus = () => {
    return reactive({
        connected: false,
        isPinned: false,
        showOverlay: false,
        isShared: false,
    })
}
