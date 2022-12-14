import type { Mod } from "../mod"
import { removeInequalitiesSubsumedByTypeConstraints } from "../pursue"
import type { Solution } from "../solution"
import {
  Substitution,
  substitutionEqual,
  substitutionPairs,
  substitutionPrefix,
  substitutionWalk,
} from "../substitution"
import { unify, unifyMany } from "../unify"
import type * as Values from "../value"
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

function maintainInequalities(
  mod: Mod,
  solution: Solution | undefined,
): Solution | undefined {
  if (solution === undefined) return undefined

  /**

     Verify `inequalities` validity.

     Next, we have to deal with the interaction between `Equal` and
     `NotEqual` constraints. Here, there are two possible cases:

     1. an `Equal` constraint may violate an existing `NotEqual` constraint;
     2. or, an `Equal` constraint may simplify an existing `NotEqual` constraint.

   **/

  const inequalities: Array<Substitution> = []
  for (const inequality of solution.inequalities) {
    const newSubstitution = unifyMany(
      mod,
      solution.substitution,
      substitutionPairs(inequality),
    )

    /**

       If the unification of the key and the value all the pairs in
       `inequality` constraint in `substitution` fails, this
       `inequality` is already satisfied by current substitution.
       Thus, this `inequality` constraint can safely be discarded.

    **/

    if (newSubstitution === undefined) {
      continue
    }

    /**

       If the unification of the key and the value all the pairs in
       `inequality` constraint in `substitution` succeeds without
       extending it, `inequality` does not hold in `substitution`.

    **/

    if (substitutionEqual(solution.substitution, newSubstitution)) {
      return undefined
    }

    /**

       Other than violating an existing `inequality` constraint, new
       `Equal` constraints may instead simplify some of the inequality
       constraints in the solution.

       A key-value pair in the `inequality` can be discarded,
       if the key is already unified to a different value by `Equal`.

       The extension of `newSubstitution` with respect to
       `substitution` will be the reduced `inequality` constraint.
       This is because whatever unifications have taken place because
       of the `Equal` constraint will be in `substitution`, and thus
       will not be in the extension. As a result, the extension will
       contain only those pairs which are missing from `substitution`,
       but whose unification will result in the violation of the
       disequality constraint.

    **/

    inequalities.push(
      substitutionPrefix(newSubstitution, solution.substitution),
    )
  }

  return solution.update({ inequalities })
}

function maintaintypeConstraints(
  mod: Mod,
  solution: Solution | undefined,
): Solution | undefined {
  if (solution === undefined) return undefined

  const typeConstraints: Array<[Values.PatternVar, Values.TypeConstraint]> = []
  for (const [variable, typeConstraint] of solution.typeConstraints) {
    const value = substitutionWalk(solution.substitution, variable)
    if (value["@kind"] === "PatternVar") {
      typeConstraints.push([value, typeConstraint])
    } else if (!typeConstraint.predicate(value)) {
      return undefined
    }
  }

  return solution.update({
    typeConstraints,
    inequalities: removeInequalitiesSubsumedByTypeConstraints(
      solution,
      solution.inequalities,
      typeConstraints,
    ),
  })
}
