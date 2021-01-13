import { Query, QueryArg, FilterGroup, Filter } from "../../src";
import { DateTime } from "luxon";

test("Query should set a condition and all setters should chain.", () => {
  const query = new Query();
  const condition = {
    field: "color",
    func: "eq",
    value: new QueryArg("string", "green", "color")
  };
  expect(query.setCondition(condition)).toStrictEqual(query);
  expect(query.condition).toStrictEqual(condition);
});

test("Query should render", () => {
  const query = new Query("greenBeans");
  const condition = {
    field: "color",
    func: "eq",
    value: new QueryArg("string", "green", "color")
  };
  query.setCondition(condition);
  query.addFields(["uid"]);

  expect(query.render()).toStrictEqual({
    string: `query greenBeans($color: string) {\ngreenBeans (func: eq(color, $color)) {\nuid\n}\n}`,
    values: [condition.value]
  });
});

test("Values should be normalized", () => {
  const query = new Query("greenBeans");
  // Normalize a string.
  expect(
    query.normalizeArgs([new QueryArg("string", "vinegar", "ingredients")])
  ).toStrictEqual({
    $ingredients: "vinegar"
  });

  // Normalize an int.
  expect(
    query.normalizeArgs([new QueryArg("int", 4000, "kcal")])
  ).toStrictEqual({
    $kcal: "4000"
  });

  // Normalize a float.
  expect(
    query.normalizeArgs(
      [new QueryArg("int", 1.4, "teraCalories")]
    )
  ).toStrictEqual({
    $teraCalories: "1.4"
  });

  // Normalize a date.
  expect(
    query.normalizeArgs(
      [new QueryArg(
        "dateTime",
        DateTime.fromISO("1993-04-28T00:00:00+00:00"),
        "yourBirthday"
      )]
    )
  ).toStrictEqual({
    $yourBirthday: "1993-04-28T00:00:00.000+00:00"
  });

  // Normalize a bool.
  expect(
    query.normalizeArgs([new QueryArg("bool", true, "allowed")])
  ).toStrictEqual({
    $allowed: "true"
  });
});

test("Query Blocks should render", () => {
  const query = new Query("main")
    .setCondition({
      func: "eq",
      field: "votes",
      value: "mostPopular"
    })
    .setFilters(
      new FilterGroup().addFilter(
        new Filter()
          .setFunc("uid")
          .setValueVariable("isOwner")
          .setField("owner")
      )
    )
    .addFields(["name"]);

  const varQuery = new Query('testVarQuery')
    .setCondition({
      func: "type",
      value: new QueryArg("string", "Reviewer", "userType")
    })
    .addFields(["uid"]);

  query.addQueryBlock(varQuery, true, [{ varName: "isOwner", path: ["uid"] }]);

  const piggybackQuery = new Query("ranking")
    .setCondition({
      func: "type",
      value: new QueryArg("string", "Post", "isPost")
    })
    .addFields(["max(votes)"]);

  query.addQueryBlock(piggybackQuery, false, [
    { varName: "mostPopular", path: ["max(votes)"] }
  ]);

  const actual = query.render();
  expect(actual.string).toMatchInlineSnapshot(`
    "query main($userType: string, $isPost: string) {
    var (func: type($userType)) {
    isOwner as uid
    }

    ranking (func: type($isPost)) {
    mostPopular as max(votes)
    }

    main (func: eq(votes, mostPopular)) @filter
    (
    uid(isOwner)
    ) {
    name
    }
    }"
  `);
  expect(actual.values).toStrictEqual([
    varQuery.condition.value,
    piggybackQuery.condition.value,
  ]);
});

test("Test execute", () => {
  let actual: any;
  const transaction: any = {
    queryWithVars(...args) {
      actual = args;
      return {
        getJson() {
          return [];
        }
      };
    }
  };

  const query = new Query("greenBeans");
  query.addFields(["uid"]);

  // Default Condition
  const defaultCondition = {
    field: "defaultField",
    func: "eq",
    value: new QueryArg("default", "Some Value", "Default")
  };
  query.setCondition(defaultCondition);
  query.execute(transaction);
  expect(actual).toStrictEqual([
    `query greenBeans($Default: string) {\ngreenBeans (func: eq(defaultField, $Default)) {\nuid\n}\n}`,
    { $Default: "Some Value" }
  ]);
});

test("Query directive should render", () => {
  const query = new Query("greenBeans");
  query.addFields(["uid"]);

  const condition = {
    field: "color",
    func: "eq",
    value: new QueryArg("string", "green", "color")
  };
  query.setCondition(condition);


  // Should render without adding any directives.
  expect(query.render()).toStrictEqual({
    string: `query greenBeans($color: string) {\ngreenBeans (func: eq(color, $color)) {\nuid\n}\n}`,
    values: [condition.value]
  });

  // Add the cascade directive.
  query.cascade();
  expect(query.render()).toStrictEqual({
    string: `query greenBeans($color: string) {\ngreenBeans (func: eq(color, $color)) @cascade {\nuid\n}\n}`,
    values: [condition.value]
  });

  // Removing a directive by calling it again.
  query.cascade();
  expect(query.render()).toStrictEqual({
    string: `query greenBeans($color: string) {\ngreenBeans (func: eq(color, $color)) {\nuid\n}\n}`,
    values: [condition.value]
  });

  // Add the normalize directive.
  query.normalize();
  expect(query.render()).toStrictEqual({
    string: `query greenBeans($color: string) {\ngreenBeans (func: eq(color, $color)) @normalize {\nuid\n}\n}`,
    values: [condition.value]
  });

  // Add the recursive directive.
  query.recursive(5,false);
  expect(query.render()).toStrictEqual({
    string: `query greenBeans($color: string) {\ngreenBeans (func: eq(color, $color)) @normalize @recursive(depth:5, loop:false) {\nuid\n}\n}`,
    values: [condition.value]
  });

});