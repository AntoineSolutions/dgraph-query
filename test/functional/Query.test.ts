import { Query, FilterGroup, Filter, Node, QueryArg } from "../../src";

test("Query should render.", () => {
  const query = new Query("tastyHamburgers");
  query.setCondition({
    func: "type",
    value: new QueryArg("string", "Hamburger", "foodType"),
  });
  const burgerFilterGroup = new FilterGroup('goodThings');
  burgerFilterGroup.addFilter(new Filter('cookedFilter')
    .setField('cooked')
    .setArg('bool', true, 'isCooked')
    .setFunc('eq'),
  );
  query.setFilters(burgerFilterGroup)
    .addFields(['uid'])
    .addEdge(new Node('owner').addFields(['name']));

  expect(query.render()).toStrictEqual({
    string: "query tastyHamburgers($isCooked: bool, $foodType: string) {\ntastyHamburgers (func: type($foodType)) @filter\n(\neq(cooked, $isCooked)\n) {\nuid\nowner {\nname\n}\n}\n}",
    values: {
      cookedFilter: new QueryArg("bool", true, "isCooked"),
      tastyHamburgers: new QueryArg("string", "Hamburger", "foodType"),
    }
  });
});
