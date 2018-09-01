/**
 * @copyright 2018-present, Charlike Mike Reagent (https://tunnckocore.com)
 * @license Apache-2.0
 */

import fs from "fs";
import path from "path";
import test from "asia";
import reporter from "../src/index";

const reportPath = path.join(__dirname, "fixtures", "report");

// eslint-disable-next-line import/no-dynamic-require
const fixture = fs.readFileSync(reportPath, "utf8");

test("foo bar", async t => {
  const output = await reporter(fixture);
  // console.log(output);

  t.ok(output && output.length);
});
