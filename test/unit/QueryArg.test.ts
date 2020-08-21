import { mergeArgs, QueryArg } from "../../src/QueryArg";
import moment, { isMoment } from "moment";

test("QueryArgs should construct.", () => {
  const queryArg = new QueryArg("default", "camembert", "cheese");
  expect(queryArg.type).toBe("default");
  expect(queryArg.value).toBe("camembert");
  expect(queryArg.name).toBe("cheese");
});

test("QueryArgs should construct with date objects.", () => {
  const timeString = "2008-01-01T01:00:00+00:00"
  // The query args should construct from a moment object and store the value
  // as a moment object.
  expect(isMoment(new QueryArg("dateTime", moment(timeString), "birthday").value)).toBeTruthy();

  // The query args should construct from a Date object and store the value as a
  // moment object.
  expect(isMoment(new QueryArg("dateTime", new Date(timeString), "birthday").value)).toBeTruthy();

  // Only valid date objects should be accepted as values for dateTime query
  // args.
  expect(() => {new QueryArg("dateTime", timeString, "birthday")}).toThrow();
});

test("QueryArgs should compare", () => {
  const queryArg = new QueryArg("int", 42, "answer");
  expect(queryArg.compare(new QueryArg("int", 42, "answer"))).toBeTruthy();
  expect(queryArg.compare(new QueryArg("default", 42, "answer"))).toBeFalsy();
  expect(queryArg.compare(new QueryArg("int", 9001, "answer"))).toBeFalsy();
  expect(queryArg.compare(new QueryArg("int", 42, "sixTimesNine"))).toBeFalsy();
});

test("Lists of QueryArgs should be merged", () => {
  const queryArgList1: any = {
    "isHoopy": new QueryArg("string", "hoopy", "isHoopy"),
    "isFrood": new QueryArg("string", "frood", "isFrood"),
  };
  const queryArgList2: any = {
    "isPresident": new QueryArg("string", "president of the galaxy", "isPresident"),
  };

  // If no args or keys conflict the lists should merge.
  const expected = Object.assign({}, queryArgList1, queryArgList2);
  expect(mergeArgs(queryArgList1, queryArgList2)).toStrictEqual(expected);

  // If an arg and its key match, the lists should merge.
  queryArgList2.isFrood = new QueryArg("string", "frood", "isFrood");
  expect(mergeArgs(queryArgList1, queryArgList2)).toStrictEqual(expected);

  // If there is a conflict between the query args between the lists, an error
  // should be thrown.
  queryArgList2.isFrood = new QueryArg("string", "Ford Prefect", "name");
  expect(() => {mergeArgs(queryArgList1, queryArgList2)}).toThrow();

  // If two args have the same name, but different values, an error should be
  // thrown.
  delete queryArgList2.isFrood;
  queryArgList2.isFord = new QueryArg("string", "Ford Prefect", "isFrood");
  expect(() => {mergeArgs(queryArgList1, queryArgList2)}).toThrow();

  // If two args have different keys, but otherwise match, an error should be
  // thrown.
  queryArgList2.isFord = new QueryArg("string", "frood", "isFrood");
  expect(() => {mergeArgs(queryArgList1, queryArgList2)}).toThrow();
});
