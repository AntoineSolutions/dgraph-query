import { v4 as uuid } from "uuid";
import { FilterGroup } from "./FilterGroup";
import union from "lodash/union";
import difference from "lodash/difference";
import { RenderedQueryComponent, KeyedList } from "./util";
import { mergeArgs, QueryArg } from "./QueryArg";

/**
 * Query Node
 *
 * A query node represents a potential node in the database, containing fields
 * and edges to other nodes.
 */
export class Node {
  id: string;
  fields: string[] = [];
  filters: FilterGroup | null = null;
  edges: Map<string, Node> = new Map();
  // @todo add sorting and other directives.

  constructor(id?: string) {
    this.id = id || uuid();
  }

  /**
   * Add fields to request from the node.
   *
   * @param {string[]} fields
   *   The fields. Duplicates will be resolved.
   */
  addFields(fields: string[]) {
    this.fields = union(this.fields, fields);
    return this;
  }

  /**
   * Removes fields from the query.
   *
   * @param {string[]} fields
   *   The fields to remove. Unincluded fields will be ignored.
   */
  removeFields(fields: string[]) {
    this.fields = difference(this.fields, fields);
    return this;
  }

  /**
   * Add an edge to the node.
   *
   * @param {Node} node
   *   The node to use as an edge. Duplicates will throw errors as nodes are not
   *   comparable.
   */
  addEdge(node: Node) {
    if (this.edges.has(node.id)) {
      throw new Error (`${node.id} is not unique for setEdge on ${this.id}`);
    }

    this.edges.set(node.id, node);
    return this;
  }

  /**
   * Remove an edge from the node.
   *
   * @param {string} nodeId
   *   The name of the node to remove from the query.
   */
  removeEdge(nodeId: string) {
    this.edges.delete(nodeId);
    return this;
  }

  /**
   * Apply or remove filters to the query.
   *
   * @param {FilterGroup | null} filters
   *   A filter group if filters are required, null to remove all filters.
   */
  setFilters(filters: FilterGroup | null) {
    this.filters = filters;
    return this;
  }

  /**
   * Render the interior portion of the node.
   *
   * @internal
   *
   * @returns {RenderedQueryComponent}
   */
  renderInner(): RenderedQueryComponent {
    let values: KeyedList<QueryArg> = {};

    // Render fields.
    // @todo Allow fields to be aliased.
    const fields = this.fields.length ? `\n${this.fields.join("\n")}` : '';

    // Render all child nodes.
    const edgeList = [];
    this.edges.forEach((node) => {
      const renderedNode = node.render();
      values = mergeArgs(values, renderedNode.values);
      edgeList.push(renderedNode.string);
    });
    const edges = edgeList.length ? `\n${edgeList.join("\n")}` : '';

    // Render.
    let filters: RenderedQueryComponent = {
      string: '',
      values: {}
    };
    if (this.filters) {
      filters = this.filters.render();
      values = mergeArgs(values, filters.values);
    }

    return {
      string: `${this.filters ? `@filter${filters.string} ` : ''}{${fields}${edges}\n}`,
      values
    }
  }

  /**
   * Render the node.
   *
   * @internal
   *
   * @returns {RenderedQueryComponent}
   */
  render(): RenderedQueryComponent {
    const output = this.renderInner();
    output.string = `${this.id} ${output.string}`
    return output;
  }
}
