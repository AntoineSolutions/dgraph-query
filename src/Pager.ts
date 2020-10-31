import { v4 as uuid } from "uuid";
import { QueryArg } from "./QueryArg";
import { KeyedList, RenderedQueryComponent } from "./util";

export class Pager {
  id: string;
  first?: QueryArg;
  after?: QueryArg;
  offset?: QueryArg;

  constructor(id?: string, first?: number, offset?: number) {
    this.id = id || uuid();
    if (first) {
      this.first = new QueryArg("int", first, "pager_first");
    }
    if (offset) {
      this.offset = new QueryArg("int", offset, "pager_offset");
    }
  }

  setFirst(first: number) {
    this.first = new QueryArg("int", first, this.id + "_first");
    return this;
  }

  setOffset(offset: number) {
    if (this.after) {
      delete this.after;
    }
    this.offset = new QueryArg("int", offset, this.id + "_offset");
    return this;
  }

  setAfter(after: string) {
    if (this.offset) {
      delete this.offset;
    }
    this.after = new QueryArg("string", after, this.id + "_after");
    return this;
  }

  render(): RenderedQueryComponent {
    if (!this.first) {
      return {
        string: "",
        values: []
      }
    }

    const values: QueryArg[] = [];

    let string = `first: $${this.first.name}`;
    values.push(this.first);
    if (this.offset) {
      string += ` offset: $${this.offset.name}`;
      values.push(this.offset);
    }
    else if (this.after) {
      string += ` after: $${this.after.name}`;
      values.push(this.after);
    }
    return {
      string,
      values,
    }
  }
}