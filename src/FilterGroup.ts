import { v4 as uuid } from "uuid";
import { Filter } from "./Filter";
import { RenderedQueryComponent } from "./util";
import { mergeArgs } from "./QueryArg";

/**
 * Groups filters and filter groups.
 */
export class FilterGroup {
  id: string;
  operator: 'AND' | 'OR' = "AND";
  isNot = false;
  filters: Map<string, Filter | FilterGroup> = new Map();

  constructor(id?: string) {
    this.id = id || uuid();
  }

  /**
   * Invert the result of this filter group.
   */
  negate() {
    this.isNot = !this.isNot
    return this;
  }

  /**
   * Add a filter to the filter group.
   *
   * @param {Filter | FilterGroup} filter
   *   Either a filter or another filter group.
   */
  addFilter(filter: Filter | FilterGroup) {
    if (this.filters.has(filter.id)) {
      throw new Error(`${filter.id} is not unique for filter group ${this.id}.`);
    }

    this.filters.set(filter.id, filter);
    return this;
  }

  /**
   * Remove a filter from the filter group.
   *
   * @param {string} filterId
   *   The filter id to remove.
   */
  removeFilter(filterId: string) {
    this.filters.delete(filterId);
    return this;
  }

  /**
   * Set the operator for the filter group.
   *
   * @param {"AND" | "OR"} operator
   *   The operator to use.
   */
  setOperator(operator: 'AND' | 'OR') {
    this.operator = operator;
    return this;
  }

  /**
   * Renders the filter group.
   *
   * @internal
   *
   * @returns {RenderedQueryComponent}
   */
  render(): RenderedQueryComponent {
    const resultStrings: string[] = [];
    const result: RenderedQueryComponent = {
      string: '',
      values: {}
    };

    this.filters.forEach((filter) => {
      const filterResult = filter.render();
      resultStrings.push(filterResult.string);
      result.values = mergeArgs(result.values, filterResult.values);
    });

    result.string = `\n${this.isNot ? 'NOT ' : ''}(\n${resultStrings.join(`\n${this.operator}\n`)}\n)`;

    return result;
  }
}
