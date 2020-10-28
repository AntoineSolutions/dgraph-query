import { v4 as uuid } from "uuid";

export class Sort {
  constructor(public id?: string, public field: string = "", public direction: "asc" | "desc" = "asc", public format: "var" | "predicate" = "predicate") {
    if (!id) {
      this.id = uuid();
    }
  }

  setVal(varName: string) {
    this.format = "var";
    this.field = varName;
    return this;
  }

  setField(field: string) {
    this.format = "predicate"
    this.field = field;
    return this;
  }

  setDirection(direction: "asc" | "desc") {
    this.direction = direction;
    return this;
  }

  /**
   * Create a new sort that is the reverse of this one.
   */
  reverse() {
    const reversed = new Sort(this.id + "_reversed")
      .setDirection(this.direction === "asc" ? "desc" : "asc");

    // Bypass the formatting in setVal and setField.
    reversed.field = this.field;
    return reversed;
  }

  render() {
    const formatStart = this.format === "var" ? "val(" : "<";
    const formatEnd = this.format === "var" ? ")" : ">"
    return `order${this.direction} ${formatStart}${this.field}${formatEnd}`;
  }
}
