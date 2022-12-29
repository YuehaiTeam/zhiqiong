import { BaseRule } from './base'
import { GhzsRule } from './ghzs/ghzs'
import { HoyolabRule } from './hoyolab/index'
import { MiyousheRule } from './miyoushe/index'
export const RuleList: typeof BaseRule[] = [MiyousheRule, HoyolabRule, GhzsRule]
