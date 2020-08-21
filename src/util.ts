import { QueryArg } from "./QueryArg";

export type RenderedQueryComponent = {
  string: string
  values: KeyedList<QueryArg>
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
