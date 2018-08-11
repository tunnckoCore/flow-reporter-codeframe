#!/usr/bin/env node-r_esm

/**
 * @copyright 2018-present, Charlike Mike Reagent (https://tunnckocore.com)
 * @license Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import proc from 'process';
import mri from 'mri';
import getStdin from 'get-stdin';

/* eslint-disable-next-line import/no-unresolved */
import reporter, { getDefaultOptions } from './dist/nodejs/index';

const def = getDefaultOptions();
const argv = mri(proc.argv.slice(2), {
  default: {
    color: def.color,
    'highlight-code': def.highlightCode,
  },
});
argv.highlightCode = argv['highlight-code'];

const inputReportFile = argv._[0];

async function main() {
  const report = inputReportFile
    ? fs.readFileSync(path.resolve(proc.cwd(), inputReportFile), 'utf8')
    : await getStdin();

  if (!report) {
    console.error('Usage:');
    console.error(
      '  flow check --json --json-version 2 | flow-reporter-codeframe',
    );
    console.error('  cat report.json | flow-reporter-codeframe');
    console.error('  flow-reporter-codeframe <path-to-report-file>');
    proc.exit(1);
  }

  const output = await reporter(report, argv);

  // We should output to the stderr stream.
  console.error(output);

  // We should exit with non-zero code, always.
  proc.exit(1);
}

main().catch((err) => {
  console.error(err.stack);
  proc.exit(1);
});
