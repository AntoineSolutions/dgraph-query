import { Sort } from "../../src";

test("A complete sort should be created from the constructor.", () => {
  const sort = new Sort("chips", "sodiumContent", "desc", "var");
  expect(sort.id).toBe("chips");
  expect(sort.field).toBe("sodiumContent");
  expect(sort.direction).toBe("desc");
  expect(sort.format).toBe("var");
});

test("A sort should be created through its methods and the methods should chain.", () => {
  const sort = new Sort();

  // Check defaults.
  expect(sort.id).toBeTruthy();
  expect(sort.direction).toBe("asc");
  expect(sort.field).toBe("");
  expect(sort.format).toBe("predicate");

  expect(sort.setVal("crunchRating")).toStrictEqual(sort);
  expect(sort.format).toBe("var");
  expect(sort.field).toBe("crunchRating");

  expect(sort.setField("flavorIntensity")).toStrictEqual(sort);
  expect(sort.format).toBe("predicate");
  expect(sort.field).toBe("flavorIntensity");

  expect(sort.setDirection("desc")).toStrictEqual(sort);
  expect(sort.direction).toBe("desc");

  expect(sort.reverse()).toStrictEqual(new Sort(
    sort.id + "_reversed",
    "flavorIntensity",
    "asc",
    sort.format
  ));
});

test("A sort should render.", () => {
  const sort = new Sort();
  sort.setField("deliciousness");
  expect(sort.render()).toBe("orderasc <deliciousness>");
  sort.setVal("crunchiness");
  expect(sort.render()).toBe("orderasc val(crunchiness)");
  sort.setDirection("desc");
  expect(sort.render()).toBe("orderdesc val(crunchiness)");
});
