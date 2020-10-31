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
