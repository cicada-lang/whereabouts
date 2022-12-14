import type { Mod } from "../mod"
import { maintainInequalities, maintaintypeConstraints } from "../pursue"
import type { Solution } from "../solution"
import { substitutionEqual } from "../substitution"
import { unify } from "../unify"
import type { Value } from "../value"

export function pursueEqual(
  mod: Mod,
  solution: Solution,
  left: Value,
  right: Value,
): Solution | undefined {
  const substitution = unify(mod, solution.substitution, left, right)

  if (substitution === undefined) {
    return undefined
  }

  if (substitutionEqual(substitution, solution.substitution)) {
    return solution
  }

  let newSolution: Solution | undefined = solution.update({ substitution })

  newSolution = maintainInequalities(mod, newSolution)
  newSolution = maintaintypeConstraints(mod, newSolution)

  return newSolution
}
