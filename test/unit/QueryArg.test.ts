import { QueryArg } from "../../src/QueryArg";
import { DateTime } from "luxon";
import { mergeArgs } from "../../src/util";

test("QueryArgs should construct.", () => {
  const queryArg = new QueryArg("default", "camembert", "cheese");
  expect(queryArg.type).toBe("default");
  expect(queryArg.value).toBe("camembert");
  expect(queryArg.name).toBe("cheese");
});

test("QueryArgs should construct with date objects.", () => {
  const timeString = "2008-01-01T01:00:00+00:00"
  // The query args should construct from a luxon object and store the value
  // as a luxon object.
  expect(DateTime.isDateTime(new QueryArg("dateTime", DateTime.fromISO(timeString), "birthday").value)).toBeTruthy();

  // The query args should construct from a Date object and store the value as a
  // luxon object.
  expect(DateTime.isDateTime(new QueryArg("dateTime", new Date(timeString), "birthday").value)).toBeTruthy();

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
  const hoopy = new QueryArg("string", "hoopy", "isHoopy");
  const frood = new QueryArg("string", "frood", "isFrood");
  const prez = new QueryArg("string", "president of the galaxy", "isPresident");

  const queryArgList1: QueryArg[] = [hoopy, frood];
  const queryArgList2: any = [prez];

  // If no args or keys conflict the lists should merge.
  const expected = [hoopy, frood, prez];
  expect(mergeArgs(queryArgList1, queryArgList2)).toStrictEqual(expected);

  // If an arg and its key match, the lists should merge.
  queryArgList2.push(queryArgList1[1]);
  expect(mergeArgs(queryArgList1, queryArgList2)).toStrictEqual(expected);

  // If two args have the same name, are different objects, an error should be
  // thrown.
  delete queryArgList2[1];
  queryArgList2.push(new QueryArg("string", "Ford Prefect", "isFrood"));
  expect(() => {mergeArgs(queryArgList1, queryArgList2)}).toThrow();
});
