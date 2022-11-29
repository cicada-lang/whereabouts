import type { Exp } from "../exp/index.ts"
import type { Goal } from "../goal/index.ts"
import * as Goals from "../goal/index.ts"
import { prepareSubstitution } from "../reify/index.ts"
import type { Solution } from "../solution/index.ts"
import {
  Substitution,
  substitutionDeepWalk,
  substitutionPairs,
} from "../substitution/index.ts"

/**

   The `Reification` of an `exp` is the reified exp,
   with a list of constraints represented as goals.

 **/

export type Reification = {
  exp: Exp
  constraints: Array<Goal>
}

export function Reification(exp: Exp, constraints: Array<Goal>): Reification {
  return { exp, constraints }
}

export function reify(solution: Solution, exp: Exp): Reification {
  exp = substitutionDeepWalk(solution.substitution, exp)
  const substitutionWithReifiedVars = prepareSubstitution(exp)
  const constraints = reifyInequalities(solution, substitutionWithReifiedVars)
  exp = substitutionDeepWalk(substitutionWithReifiedVars, exp)
  return Reification(exp, constraints)
}

export function reifyInequalities(
  solution: Solution,
  substitution: Substitution,
): Array<Goal> {
  return solution.inequalities.map((inequality) =>
    Goals.Disj(
      substitutionPairs(inequality).map(([left, right]) =>
        Goals.NotEqual(
          substitutionDeepWalk(substitution, left),
          substitutionDeepWalk(substitution, right),
        ),
      ),
    ),
  )
}
