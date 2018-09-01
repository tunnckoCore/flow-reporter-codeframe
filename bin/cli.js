#!/usr/bin/env node

"use strict";

const proc = require("process");
const esmLoader = require("esm");

const main = esmLoader(module)("./index").default;

main().catch(err => {
  console.error(err.stack);
  proc.exit(1);
});
