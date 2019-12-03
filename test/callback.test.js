/* eslint-env node, jest */
const Babel = require('@babel/standalone');

const code = `let i = 0; while (true) { i++; }; done(i)`;

let done = jest.fn();

beforeEach(() => {
  done = jest.fn();
});

const transform = id => code =>
  Babel.transform(new Function(code).toString(), {
    plugins: [id],
  }).code; // eslint-disable-line no-new-func

const run = code => {
  // console.log(code);
  eval(`(${code})()`); // eslint-disable-line no-eval
};

test('no callback', () => {
  const id = 'lp1';
  Babel.registerPlugin(id, require('../lib')(100));
  const after = transform(id)(code);
  run(after);
  expect(done).toBeCalledWith(expect.any(Number));
});

test('anonymous callback', () => {
  const id = 'lp2';
  Babel.registerPlugin(
    id,
    require('../lib')(100, line => done(`line: ${line}`))
  );
  const after = transform(id)(code);
  run(after);
  expect(done).toHaveBeenCalledWith('line: 3');
});

test('arrow function callback', () => {
  const id = 'lp3';
  const callback = line => done(`lp3: ${line}`);

  Babel.registerPlugin(id, require('../lib')(100, callback));
  const after = transform(id)(code);
  run(after);
  expect(done).toHaveBeenCalledWith(`${id}: 3`);
});

test('named function callback', () => {
  const id = 'lp4';
  function callback(line) {
    done(`lp4: ${line}`);
  }

  Babel.registerPlugin(id, require('../lib')(100, callback));
  const after = transform(id)(code);
  run(after);
  expect(done).toHaveBeenCalledWith(`${id}: 3`);
});
