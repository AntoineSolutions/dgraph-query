import { QueryArg } from "../../src";
import { renderFunc } from "../../src/util";

test("renderFunc should render functions", () => {
  const queryArg = new QueryArg("string", "exquisite", "deliciousness");
  expect(renderFunc("uid", queryArg)).toBe(`uid($deliciousness)`);
  expect(renderFunc("type", queryArg)).toBe(`type($deliciousness)`);
  expect(renderFunc("ge", queryArg, "flavor")).toBe(`ge(flavor, $deliciousness)`);
});
