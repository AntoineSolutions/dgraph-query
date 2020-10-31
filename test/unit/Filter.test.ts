import { Filter } from "../../src";

test("Filter should create an id", () => {
  expect(new Filter().id).toBeTruthy();
  expect(new Filter("green beans").id).toBe("green beans");
});

test("Filter should set values for all properties and everything should chain.", () => {
  const filter = new Filter();
  expect(filter.setArg({type: "string", name: "cool_vegetables", value: "green beans"} as any)).toStrictEqual(filter);
  expect(filter.filterArg).toStrictEqual({type: "string", name: "cool_vegetables", value: "green beans"});

  expect(filter.setFunc("eq")).toStrictEqual(filter);
  expect(filter.func).toBe("eq");

  expect(filter.isNot).toBe(false);
  expect(filter.negate()).toStrictEqual(filter);
  expect(filter.isNot).toBe(true);

  expect(filter.setField("coolVegetables")).toStrictEqual(filter);
  expect(filter.field).toBe("coolVegetables");
});

test("Filter should render.", () => {
  const filter = new Filter("greenBeans")
    .setFunc("eq")
    .setField("coolVegetables")
    .setArg({type: "string", name: "cool_vegetables", value: "green beans"} as any);

  expect(filter.render()).toStrictEqual({
    string: "eq(coolVegetables, $cool_vegetables)",
    values: [{
        type: "string",
        name: "cool_vegetables",
        value: "green beans",
      },
    ],
  });
});

test("Filter should negate.", () => {
  const filter = new Filter("greenBeans")
    .setFunc("eq")
    .setArg({type: "string", name: "cool_vegetables", value: "green beans"} as any)
    .setField("coolVegetables")
    .negate();

  expect(filter.render()).toStrictEqual({
    string: "NOT eq(coolVegetables, $cool_vegetables)",
    values: [
      {
        type: "string",
        name: "cool_vegetables",
        value: "green beans",
      },
    ],
  })
});
