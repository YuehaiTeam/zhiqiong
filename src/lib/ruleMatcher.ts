export type RuleItem = RegExp | string | ((location: typeof window.location) => boolean)
export interface RuleMatchable {
    rule: RuleItem[]
}

export function ruleMatcherSingle(location: typeof window.location, rule: RuleItem): boolean {
    if (rule instanceof RegExp) {
        return rule.test(location.href)
    }
    if (typeof rule === 'string') {
        return location.host === rule
    }
    return rule(location)
}

export function ruleMatcher<T extends RuleMatchable>(location: typeof window.location, rules: T[]): T[] {
    return rules.filter((rule) => rule.rule.some((r) => ruleMatcherSingle(location, r)))
}
