_Generated using [docks](http://npm.im/docks)._
### [src/index.js](/src/index.js)

#### [flowReporter](/src/index.js#L47)
Formatting the `val` to look like ESLint's cool `codeframe` reporter.
It may be a bit more verbose and to have a bit more lines of code than
the Flow's default one, but that's not a bad thing.

You should provide valid report, which means that for now you are forced to
use `--json --json-version 2` flags if you want to use that reporter.

<p align="center">
  <img src="./media/api-usage.svg">
</p>

**Params**
- `val` **{string|object}** the Flow's JSON version 2 thingy, `--json` + `--json-version 2`
- `opts` **{object}** optional options `color` and `highlightCode`

**Returns**
- `Promise` resolves to a `string` if there is errors, `undefined` if no errors

**Examples**
```javascript
import execa from 'execa';
import reporter, { getDefaultOptions } from 'flow-reporter-codeframe';

async function main() {
  try {
    await execa('flow', ['check', '--json', '--json-version', '2']);
  } catch (err) {
    const output = await reporter(err.stdout, getDefaultOptions());
    console.log(output);
  }
}

main();
```

#### [.getDefaultOptions](/src/index.js#L220)
Get default options for the reporter. By default,
we have colors turned on, and highlighting code turned off.

**Returns**
- `object` containing `{ color: boolean, highlightCode: boolean }`

**Examples**
```javascript
import { getDefaultOptions } from 'flow-reporter-codeframe';

console.log(getDefaultOptions());
// => { color: true, highlightCode: false }
```