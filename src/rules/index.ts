import { BaseRule } from './base'
import { GhzsRule } from './ghzs/ghzs'
import { HoyolabRule } from './hoyolab/index'
import { MiyousheRule } from './miyoushe/index'
import { KongyingV3Rule } from './kongying/kongying-v3'
export const RuleList: typeof BaseRule[] = [MiyousheRule, HoyolabRule, GhzsRule, KongyingV3Rule]
