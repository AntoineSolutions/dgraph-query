import { FilterGroup, QueryArg, Filter } from "../../src";

test("FilterGroup should create an id", () => {
  expect(new FilterGroup().id).toBeTruthy();
  expect(new FilterGroup("balancedDiet").id).toBe("balancedDiet");
});

test("FilterGroup should set all fields and all setters should chain.", () => {
  const filterGroup = new FilterGroup();
  expect(filterGroup.setOperator("OR")).toStrictEqual(filterGroup);
  expect(filterGroup.operator).toBe("OR");

  expect(filterGroup.addFilter(new FilterGroup("coolBeans"))).toStrictEqual(filterGroup);
  expect(filterGroup.filters.has("coolBeans")).toBe(true);

  expect(filterGroup.removeFilter("coolBeans")).toStrictEqual(filterGroup);
  expect(filterGroup.filters.has("coolBeans")).toBe(false);

  expect(filterGroup.isNot).toBe(false);
  expect(filterGroup.negate()).toStrictEqual(filterGroup);
  expect(filterGroup.isNot).toBe(true);

  expect(() => {
    filterGroup
      .addFilter(new FilterGroup("jellyBeans"))
      .addFilter(new FilterGroup("jellyBeans"))
  }).toThrow();
});

test("FilterGroup should render", () => {
  const greenBeansFilter = new Filter("greenBeans")
    .setField("description")
    .setFunc("eq")
    .setArg(new QueryArg("string", "Green beans are the unripe, young fruit and protective pods of various cultivars of the common bean", "beansDescription"));

  const asparagusFilter = new Filter("asparagus")
    .setField("description")
    .setFunc("eq")
    .setArg(new QueryArg("string", "Asparagus is tasty too", "asparagusDescription"));

  const filterGroup = new FilterGroup()
    .addFilter(greenBeansFilter);

  expect(filterGroup.render()).toStrictEqual({
    string: "\n(\neq(description, $beansDescription)\n)",
    values: {
      greenBeans: greenBeansFilter.filterArg
    },
  });

  filterGroup.addFilter(asparagusFilter);

  expect(filterGroup.render()).toStrictEqual({
    string: "\n(\neq(description, $beansDescription)\nAND\neq(description, $asparagusDescription)\n)",
    values: {
      greenBeans: greenBeansFilter.filterArg,
      asparagus: asparagusFilter.filterArg,
    },
  });

  filterGroup.negate();
  filterGroup.setOperator("OR");
  expect(filterGroup.render()).toStrictEqual({
    string: "\nNOT (\neq(description, $beansDescription)\nOR\neq(description, $asparagusDescription)\n)",
    values: {
      greenBeans: greenBeansFilter.filterArg,
      asparagus: asparagusFilter.filterArg,
    },
  });
});
