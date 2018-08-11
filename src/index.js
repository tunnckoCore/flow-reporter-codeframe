/**
 * @copyright 2018-present, Charlike Mike Reagent (https://tunnckocore.com)
 * @license Apache-2.0
 */

import path from 'path';
import proc from 'process';
import isCI from 'is-ci';
import fs from 'fs-extra';
import ansi from 'ansi-colors';
import isColors from 'supports-color';
import { codeFrameColumns } from '@babel/code-frame';

export default async function flowReporter(val, opts) {
  const options = Object.assign(
    {
      color: isCI === true ? false : isColors.stdout.level,
      highlightCode: false,
    },
    opts,
  );
  ansi.enabled = options.color;

  return new Promise(async (resolve) => {
    let result = null;

    if (val && typeof val === 'object') {
      result = val;
    } else if (val && typeof val === 'string') {
      result = JSON.parse(val);
    }

    if (result.passed) {
      resolve();
      return;
    }

    const output = result.errors
      .map(normalize)
      .map(normalizeRefs('primary'))
      .map(normalizeRefs('root'))
      .map(getContents)
      .map((x) => createFrame(x, options))
      .reduce(outputError, []);

    output.unshift('');
    output.push(`${result.errors.length} errors found.`);

    resolve(output.join('\n'));
  });
}

function normalize({ primaryLoc, referenceLocs, messageMarkup }) {
  const message = messageMarkup
    .reduce((acc, item) => {
      if (item.kind === 'Text') {
        return acc.concat(item.text);
      }
      if (item.kind === 'Code') {
        return acc.concat(ansi.bold(item.text));
      }
      if (item.kind === 'Reference') {
        const type = item.message[0].text;
        return acc.concat(ansi.underline(type), ' ', `[${item.referenceId}]`);
      }

      return acc;
    }, [])
    .join('')
    .replace('[1]', ansi.bold.blue('[1]'))
    .replace('[2]', ansi.bold.red('[2]'));

  return { message, primary: primaryLoc, root: referenceLocs['2'] };
}

function normalizeRefs(type) {
  return (res) => {
    if (type === 'root' && !res.root) {
      return res;
    }

    const refStart = res[type].start;
    const refEnd = res[type].end;

    const ref = {
      cwd: proc.cwd(),
      absolutePath: res[type].source,
      loc: {
        start: { line: refStart.line, column: refStart.column },
        end: { line: refEnd.line, column: refEnd.column + 1 },
      },
      id: type === 'primary' ? '[1]' : '[2]',
    };

    /* istanbul ignore if */
    if (isCI) {
      // various shitty tweaks for CI environment
      const basename = path.basename(ref.cwd);

      const index = ref.absolutePath.indexOf(basename);
      const filepath = ref.absolutePath.slice(index + basename.length + 1);
      ref.absolutePath = path.join(ref.cwd, filepath);
    }

    ref.relativePath = path.relative(ref.cwd, ref.absolutePath);

    const { start } = ref.loc;
    ref.shownPath = `${ref.relativePath}:${start.line}:${start.column}`;

    res[type] = ref;
    return res;
  };
}

function getPath(x) {
  /* istanbul ignore if */
  if (isCI === true) {
    return path.resolve(proc.cwd(), x.relativePath);
  }
  return x.absolutePath;
}

function getContents({ primary, root, message }) {
  /* eslint-disable no-param-reassign */
  primary.content = fs.readFileSync(getPath(primary), 'utf8');

  if (root) {
    root.content = fs.readFileSync(getPath(root), 'utf8');
  }

  /* eslint-enable no-param-reassign */

  return { primary, root, message };
}

function createFrame({ primary, root, message }, { color, highlightCode }) {
  /* eslint-disable no-param-reassign */
  primary.frame = codeFrameColumns(primary.content, primary.loc, {
    highlightCode: color && highlightCode,
    message: ansi.blue(primary.id),
  });

  if (root) {
    root.frame = codeFrameColumns(root.content, root.loc, {
      highlightCode: color && highlightCode,
      message: ansi.red(root.id),
    });
  }

  /* eslint-enable no-param-reassign */

  return { primary, root, message };
}

function outputError(acc, { primary, root, message }) {
  acc.push(
    [
      `${ansi.red('error')}: ${ansi.bold('some type failures found')}`,
      ansi.dim('(null)'),
      'at',
      `${ansi.green(primary.shownPath)}:`,
    ].join(' '),
  );

  acc.push(message);
  acc.push('');
  acc.push(ansi.blue(primary.shownPath));
  acc.push(primary.frame);
  if (root) {
    acc.push('');
    acc.push(ansi.red(root.shownPath));
    acc.push(root.frame);
  }
  acc.push('');

  return acc;
}
