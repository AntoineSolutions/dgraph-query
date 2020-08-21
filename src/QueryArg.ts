import { KeyedList } from "./util";
import moment, { isDate, isMoment } from "moment";

export type Scalar = "default" | "int" | "float" | "string" | "bool" | "dateTime" | "geo";
export class QueryArg {
  constructor(public type: Scalar, public value: any, public name: string) {
    // If the dateTime passed is not moment try and create moment with value.
    if (this.type === 'dateTime' && !isMoment(this.value)) {
      // If value is a date then get the string from date and pass to moment.
      if (isDate(value)) {
        this.value = moment(value.toISOString())
      }
      else {
        throw new Error("Value must be a date or moment object")
      }
    }
  }

  compare(other: QueryArg) {
    return this.type === other.type && this.value === other.value && this.name === other.name;
  }
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
export function mergeArgs(values1: KeyedList<QueryArg>, values2: KeyedList<QueryArg>): KeyedList<QueryArg> {
  const result: KeyedList<QueryArg> = Object.assign({}, values1);

  // If the first list of values is empty, return the second list of values.
  if (!Object.keys(result).length) {
    return values2;
  }

  for (const key2 of Object.keys(values2)) {
    for (const key1 of Object.keys(values1)) {
      const value2 = values2[key2];
      const value1 = values1[key1];
      const valIsSame = value1.compare(value2) || value1.name === value2.name;
      const keyIsSame = key1 === key2;
      if (keyIsSame !== valIsSame) {
        throw new Error(`Arg ${key1} conflicts with arg ${key2}`);
      }
      result[key2] = value2;
    }
  }
  return result;
}
