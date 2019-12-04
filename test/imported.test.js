/* eslint-env node, jest */
const Babel = require('@babel/standalone');
const plugin = require('../lib');
import callback from './callback-exported';

const transform = id => code =>
  Babel.transform(new Function(code).toString(), {
    plugins: [id],
  }).code; // eslint-disable-line no-new-func

const run = code => {
  // console.log(code);
  eval(`(${code})()`); // eslint-disable-line no-eval
};

describe('imported anonymous callback', () => {
  it('uses imported callbacks', () => {
    const id = 'i1';

    const code = `let i = 0;
    while (true) {
      i++;
    }`;

    const spy = jest.fn();
    global.console = { log: spy };

    // const spy = jest.spyOn(global.console, 'log');

    Babel.registerPlugin(id, plugin(100, callback));
    const after = transform(id)(code);
    run(after);
    expect(spy).toHaveBeenCalledWith(`ok: 4`);
  });
});
