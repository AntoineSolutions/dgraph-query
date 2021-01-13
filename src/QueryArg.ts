import { DateTime } from "luxon";

export type Scalar = "default" | "int" | "float" | "string" | "bool" | "dateTime" | "geo";
export class QueryArg {
  constructor(public type: Scalar, public value: any, public name: string) {
    // If the dateTime passed is not luxon try and create luxon with value.
    if (this.type === 'dateTime' && !DateTime.isDateTime(this.value)) {
      // If value is a date then get the string from date and pass to luxon.
      if (value instanceof Date || Object.prototype.toString.call(value) === '[object Date]') {
        this.value = DateTime.fromJSDate(value)
      }
      else {
        throw new Error("Value must be a date or luxon object")
      }
    }
  }

  compare(other: QueryArg) {
    return this.type === other.type && this.value === other.value && this.name === other.name;
  }
}
