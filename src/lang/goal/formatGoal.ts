import type { Goal } from "../goal"
import { formatValue } from "../value"

export function formatGoal(goal: Goal): string {
  switch (goal["@kind"]) {
    case "Apply": {
      const args = goal.args.map((arg) => formatValue(arg)).join(", ")
      return `${goal.name}(${args})`
    }

    case "Equal": {
      return `${formatValue(goal.left)} = ${formatValue(goal.right)}`
    }

    case "NotEqual": {
      return `${formatValue(goal.left)} != ${formatValue(goal.right)}`
    }

    case "Conj": {
      const goals = goal.goals.map(formatGoal).join(" ")
      return `conj { ${goals} }`
    }

    case "Disj": {
      const goals = goal.goals.map(formatGoal).join(" ")
      return `disj { ${goals} }`
    }
  }
}
