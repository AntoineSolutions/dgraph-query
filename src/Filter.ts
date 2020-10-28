import { v4 as uuid } from "uuid";
import { RenderedQueryComponent, renderFunc } from "./util";
import { QueryArg, Scalar } from "./QueryArg";

/**
 * Filters a query node.
 */
export class Filter {
  id: string;
  func: string;
  filterArg: QueryArg | string
  isNot = false;
  field: string;

  constructor(id?: string, func?: string, filterArg?: QueryArg | Scalar, value?: any, name?: string) {
    this.id = id || uuid();

    if (!func != !filterArg) {
      throw new Error('Filter requires either both a func and filterArg or neither.');
    }
    if (func) {
      this.setFunc(func);
      this.setArg(filterArg, value, name);
    }
  }

  /**
   * Negate the result of the filter.
   *
   * @returns {Filter}
   */
  negate(): Filter {
    this.isNot = !this.isNot
    return this;
  }

  setValueVariable(name: string) {
    this.filterArg = name;
    return this;
  }

  /**
   * Set the filter's arg.
   *
   * @param {QueryArg | Scalar} filterArg
   *   Either a complete QueryArg or a scalar type.
   * @param {any} value
   *   The filter's value. Not required if filterArg is a QueryArg.
   * @param {string} name
   *   The filter's name. Not required if filterArg is a QueryArg.
   *
   * @returns {Filter}
   */
  setArg(filterArg: QueryArg | Scalar, value?: any, name?: string): Filter {
    if (typeof filterArg === "string") {
      filterArg = new QueryArg(filterArg, value, name);
    }
    this.filterArg = filterArg;
    return this;
  }

  /**
   * Set the filter's function.
   *
   * @param {string} func
   */
  setFunc(func: string) {
    this.func = func;
    return this;
  }

  /**
   * Set the field the filter should apply to.
   *
   * @param {string} field
   */
  setField(field: string) {
    this.field = field;
    return this;
  }

  /**
   * Render the filter.
   *
   * @internal
   *
   * @returns {RenderedQueryComponent}
   *   The rendered filter.
   */
  render(): RenderedQueryComponent {
    const result: RenderedQueryComponent = {
      string: '',
      values: {},
    };
    if (typeof this.filterArg !== "string") {
      result.values[this.id] = this.filterArg;
    }
    result.string = renderFunc(this.func, this.filterArg, this.field)

    result.string = `${this.isNot ? 'NOT ' : ''}${result.string}`;
    return result;
  }
}
