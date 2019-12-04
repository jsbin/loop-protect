/* eslint-env node, jest */
const Babel = require('@babel/standalone');
Babel.registerPlugin('loopProtection', require('../lib')(100));
const assert = e => console.assert(e);

const loopProtect = code =>
  Babel.transform(new Function(code).toString(), {
    plugins: ['loopProtection'],
  }).code; // eslint-disable-line no-new-func
const run = code => eval(`(${code})()`); // eslint-disable-line no-eval

describe('non-JS Bin use', () => {
  it('should catch infinite loop', () => {
    var code = 'var i = 0; while (true) {\ni++;\n}\nreturn "∞"';

    var processed = loopProtect(code);

    var result = run(processed);
    assert(result === '∞', 'code ran and returned ' + result);
  });
});
