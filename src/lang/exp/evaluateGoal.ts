import * as Exps from "../exp"
import * as Goals from "../goal"
import { Goal } from "../goal"
import { Mod } from "../mod"

export function evaluateGoal(mod: Mod, goal: Exps.Goal): Goal {
  switch (goal.kind) {
    case "GoalApply": {
      /** NOTE Support mutual recursive relations. **/
      const relation = mod.findOrCreateRelation(goal.name)
      return Goals.Apply(goal.name, relation, Exps.evaluate(goal.arg))
    }

    case "GoalUnifiable": {
      return Goals.Unifiable(
        Exps.evaluate(goal.left),
        Exps.evaluate(goal.right),
      )
    }
  }
}
