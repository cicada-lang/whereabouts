import { Goal, GoalQueue } from "../goal"
import { Solution } from "../solution"

export class And extends Goal {
  constructor(public goals: Array<Goal>) {
    super()
  }

  evaluate(solution: Solution): Array<GoalQueue> {
    return [new GoalQueue(solution, this.goals)]
  }
}
