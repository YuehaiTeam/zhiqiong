import { BaseRule } from './base'
import { HoyolabRule } from './hoyolab/index'
import { MiyousheRule } from './miyoushe/index'
export const RuleList: typeof BaseRule[] = [MiyousheRule, HoyolabRule]
