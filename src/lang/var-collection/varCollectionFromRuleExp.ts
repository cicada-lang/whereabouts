import type { RuleExp } from "../rule-exp"
import type { VarCollection } from "../var-collection"
import { varCollectionFromExp, varCollectionMerge } from "../var-collection"

export function varCollectionFromRuleExp(rule: RuleExp): VarCollection {
  switch (rule["@kind"]) {
    case "Case": {
      return varCollectionMerge([
        varCollectionFromExp(rule.from),
        varCollectionFromExp(rule.to),
      ])
    }

    case "List": {
      return varCollectionMerge(rule.rules.map(varCollectionFromRuleExp))
    }
  }
}
