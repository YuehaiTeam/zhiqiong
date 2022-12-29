import { MiyousheRule } from '../miyoushe'

export class HoyolabRule extends MiyousheRule {
    static rule = ['act.hoyolab.com']
    async init(): Promise<void> {
        this.window.document.body.classList.add('zhiqiong-rule-hoyolab')
        await super.init()
    }
}
