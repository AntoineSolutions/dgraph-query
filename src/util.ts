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
  // If the first list of values is empty, return the second list of values.
  if (!values1.length) {
    return values2;
  }

  const result = [...values1, ...values2];

  // Takes the array and removes duplicate objects based on values and also
  // checks for conflicts, which if found will throw an error.
  return result.reduce((acc: QueryArg[], current: QueryArg) => {
    const conflict = acc.find(item => item.name === current.name && (item.value !== current.value || item.type !== current.type));
    if (conflict) {
      // Can't have multiple args with the same name and different values.
      throw new Error(`Cannot reuse query arg with name: "${current.name}" with different type or value.`);
    }
    // Find index of item that matches current to replace with new query arg.
    const matchedIndex = acc.findIndex(item => item.compare(current));
    if (matchedIndex  === -1) {
      return acc.concat([new QueryArg(current.type, current.value, current.name)]);
    } else {
      // Replace the matching element with a new query arg to replace them.
      acc.splice(matchedIndex, 1, new QueryArg(current.type, current.value, current.name));
      return acc;
    }
  }, []);
}
