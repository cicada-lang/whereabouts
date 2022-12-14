import type { Goal } from "../goal"
import type { Mod } from "../mod"
import { pursue } from "../pursue"
import { Solution } from "../solution"

/**

   Constraint logic programming seems to me
   much like how a person solve a problem
   by working on partial solutions until some of them are complete.

   A `Solver` has a queue of `partialSolutions`,
   one solution represents a path we are searching.

   A `Solution` has a queue of `goals`,
   if this queue is not empty, the solution is partial.

   Beside the `goals`, a `Solution` is composed by many kind of constraints,
   among which the most important one is `substitution` of bindings,
   `goals` can be viewed as special constraint.

   To work on a solution is to pursue it's first goal.

   Working on a solution might generate new solutions to work on,
   for examples, one new solution for each clause of a relation,
   or one new solution for each subgoal of a disjunction,
   representing a new branching path to search.

**/

export type SolveOptions = {
  limit: number
}

export class Solver {
  solutions: Array<Solution> = []

  constructor(public partialSolutions: Array<Solution>) {}

  static start(goals: Array<Goal>): Solver {
    return new Solver([Solution.initial(goals)])
  }

  solve(mod: Mod, options: SolveOptions): Array<Solution> {
    const limit = options.limit || Infinity
    while (this.solutions.length < limit && this.partialSolutions.length > 0) {
      this.solveStep(mod)
    }

    /**

       `this.solveStep` might find more then one solutions in one step,
       thus the length of `this.solutions` might be larger than the `limit`.

     **/

    return this.solutions.slice(0, limit)
  }

  solveStep(mod: Mod): void {
    /**

       Doing side-effect on `this.partialSolutions` is intended,
       because `Solver` is the interfacing class to provide
       interaction to users.

    **/

    const solution = this.partialSolutions.shift() as Solution

    /**

       We can do side-effect to `solution` in the following code,
       because when we get it out from queue it is already not owned
       by any other code anymore.

       If we do not use side-effect here, we have to construct a
       similar `solution` to pass to `pursue` anyway.

    **/

    const goal = solution.goals.shift()
    if (goal === undefined) {
      this.solutions.push(solution)
      return
    }

    const partialSolutions = pursue(mod, mod.env, solution, goal)

    /**

       We try to be fair by pushing the
       newly generated `partialSolutions`
       to the end of the queue -- `this.partialSolutions`.

    **/

    for (const partialSolution of partialSolutions) {
      if (partialSolution.goals.length === 0) {
        this.solutions.push(partialSolution)
      } else {
        this.partialSolutions.push(partialSolution)
      }
    }
  }
}
