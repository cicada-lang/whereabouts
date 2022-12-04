import * as pt from "@cicada-lang/partech"

export function pattern_variable_names_matcher(tree: pt.Tree): Array<string> {
  return pt.matcher({
    "pattern_variable_names:pattern_variable_names": ({
      pattern_variable_names,
      last_name,
    }) => [
      ...pt.matchers.zero_or_more_matcher(pattern_variable_names).map(pt.str),
      pt.str(last_name),
    ],
  })(tree)
}
