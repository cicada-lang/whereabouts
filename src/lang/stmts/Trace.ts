import { indent } from "../../utils/indent"
import type { GoalExp } from "../goal-exp"
import type { Mod } from "../mod"
import { Solver } from "../solver"
import type { Span } from "../span"
import { Stmt } from "../stmt"
import {
  varCollectionFromGoalExp,
  varCollectionMerge,
  varCollectionValidate,
} from "../var-collection"
import { formatSolver } from "./utils/formatSolver"
import { prepareGoals } from "./utils/prepareGoals"

export class Trace extends Stmt {
  constructor(
    public steps: number,
    public goals: Array<GoalExp>,
    public span?: Span,
  ) {
    super()
  }

  async validate(mod: Mod): Promise<void> {
    varCollectionValidate(
      varCollectionMerge([...this.goals.map(varCollectionFromGoalExp)]),
    )
  }

  async execute(mod: Mod): Promise<string> {
    const { goals, variables } = prepareGoals(mod, this.goals, [])
    const solver = Solver.start(goals)
    let n = 0
    const steps: Array<string> = []
    while (n < this.steps && solver.partialSolutions.length > 0) {
      steps.push(formatSolver(solver))
      solver.solveStep(mod)
      n++
    }

    return `solver trace steps ${n} {\n${indent(steps.join("\n\n"))}\n}`
  }
}