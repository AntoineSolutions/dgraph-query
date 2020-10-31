import { QueryArg } from "./QueryArg";

export type RenderedQueryComponent = {
  string: string
  values: QueryArg[]
}

export type KeyedList<T> = {[key: string]: T}

/**
 * Renders a func for filters or conditions.
 *
 * @param {string} func
 *   The func name.
 * @param {QueryArg | string} value
 *   The argument values. If the value is injected into the query, it should
 *   be a query arg, otherwise the condition can reference vars created by
 *   other parts of the query as a string.
 * @param {string} field
 *   The field. For some funcs, like "uid" or "type", this field is optional.
 */
export function renderFunc(func: string, value: QueryArg | string, field?: string) {
  const valueName = typeof value === "string" ? value : `$${value.name}`
  switch (func) {
    case "uid":
      return `uid(${valueName})`;
    case "type":
      return `type(${valueName})`;
    default:
      return `${func}(${field}, ${valueName})`;
  }
}

/**
 * Ensure the predicate name is valid.
 *
 * @see https://dgraph.io/docs/master/query-language/schema/#predicate-name-rules
 *
 * @param predicate
 */
export function predicateIsValid(predicate: string) {
  const singleMatch = /^[]|[|&|*|(|)|_|\-|+|=|!|#|$|%]$/;
  const forbidMatch = /[\^|\||{|}|`|\\|~]|\s/;

  return !predicate.match(singleMatch) && !predicate.match(forbidMatch);
}

/**
 * Merges two lists of QueryArgs together.
 *
 * @param {KeyedList<QueryArg>} values1
 * @param {KeyedList<QueryArg>} values2
 *
 * @returns {KeyedList<QueryArg>}
 *
 * @throws
 *   Throws an error if there is a conflict in either the name or the content
 *   of a query arg. If both the name and content are identical, it merges
 *   without error.
 */
export function mergeArgs(values1: QueryArg[], values2: QueryArg[]): QueryArg[] {
  const result = [...values1];

  // If the first list of values is empty, return the second list of values.
  if (!result.length) {
    return [...values2];
  }

  for (const value2 of values2) {
    for (const value1 of values1) {
      if (value1.name === value2.name && value1 !== value2) {
        // Can't have multiple args with the same name.
        throw new Error(`Arg ${value2.name} conflicts with arg ${value1.name}`);
      }
      if (!result.includes(value2)) {
        // If the arg isn't already included, include it.
        result.push(value2);
      }
    }
  }

  return result;
}
