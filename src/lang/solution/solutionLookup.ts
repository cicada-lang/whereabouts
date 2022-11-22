import type { Exp } from "../exp"
import type { Solution } from "../solution"

export function solutionLookup(
  solution: Solution,
  name: string,
): Exp | undefined {
  while (solution["@kind"] !== "SolutionNull") {
    if (solution.name === name) {
      return solution.exp
    } else {
      solution = solution.rest
    }
  }
}