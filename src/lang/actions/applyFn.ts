import { doTerm } from "../actions"
import { envMerge } from "../env"
import * as Errors from "../errors"
import { match } from "../match"
import type { Mod } from "../mod"
import type { Stmt } from "../stmt"
import { ReturnValue } from "../stmts"
import {
  substitutionDeepWalk,
  substitutionEmpty,
  substitutionEntries,
} from "../substitution"
import type { Value } from "../value"
import * as Values from "../value"
import { formatValue } from "../value"

export function applyFn(target: Values.Fn, args: Array<Value>): Value {
  const mod = target.mod.copy()
  mod.env = envMerge(mod.env, target.env)
  matchPatterns(mod, target.patterns, args)
  const value = catchReturnValue(mod, target.stmts)
  return target.patterns.length < args.length
    ? doTerm(mod, value, args.slice(0, target.patterns.length))
    : value
}

function matchPatterns(
  mod: Mod,
  patterns: Array<Value>,
  args: Array<Value>,
): void {
  let substitution = substitutionEmpty()

  for (const [index, pattern] of patterns.entries()) {
    const arg = args[index]
    if (arg === undefined) {
      throw new Errors.LangError(
        [
          `[applyFn] not enough arguments`,
          `  pattern: ${formatValue(pattern)}`,
        ].join("\n"),
      )
    }

    const newSubstitution = match(mod, substitution, pattern, arg)
    if (newSubstitution === undefined) {
      throw new Errors.LangError(
        [
          `[applyFn] fail to match pattern with arg`,
          `  pattern: ${formatValue(pattern)}`,
          `  arg: ${formatValue(arg)}`,
        ].join("\n"),
      )
    }

    substitution = newSubstitution
  }

  for (const [name, value] of substitutionEntries(substitution)) {
    mod.define(name, substitutionDeepWalk(substitution, value))
  }
}

function catchReturnValue(mod: Mod, stmts: Array<Stmt>): Value {
  try {
    mod.executeStmtsSync(stmts)
    return Values.Null()
  } catch (error) {
    if (error instanceof ReturnValue) {
      return error.value
    }

    throw error
  }
}
