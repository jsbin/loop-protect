/* eslint-env node, jest */
const Babel = require('@babel/standalone');
Babel.registerPlugin('loopProtection', require('../lib')(100));
const assert = e => console.assert(e);

const code = {
  simple: 'return "remy";',
  simplefor:
    'var mul = 1; for (var i = 0; i < 10; i++) {\nmul = i;\n}\nreturn i',
  simplefor2:
    'var mul = 1; for (var i = 0; i < 10; i++) {\nmul = i;\n}\nreturn i',
  onelinefor: 'var i = 0, j = 0;\nfor (; i < 10; i++) j = i * 10;\nreturn i;',
  onelinefor2: 'var i=0;\nfor(i=0; i<10; ++i){ break; }\nreturn i;',
  simplewhile: 'var i = 0; while (i < 100) {\ni += 10;\n}\nreturn i;',
  onelinewhile: 'var i = 0; while (i < 100) i += 10;\nreturn i;',
  onelinewhile2: 'function noop(){}; while (1) noop("Ha.");',
  whiletrue: 'var i = 0;\nwhile(true) {\ni++;\n}\nreturn true;',
  irl1:
    'var nums = [0,1];\n var total = 8;\n for(var i = 0; i <= total; i++){\n var newest = nums[i--]\n nums.push(newest);\n }\n return i;',
  irl2:
    'var a = 0;\n for(var j=1;j<=2;j++)\n for(var i=1;i<=30000;i++) {\n a += 1;\n }\n return a;',
  notloops:
    'console.log("do");\nconsole.log("while");\nconsole.log(" foo do bar ");\nconsole.log(" foo while bar ");\nreturn true;',
  notprops:
    'var foo = { "do": "bar" }; if (foo["do"] && foo.do) {}\nreturn true;',
  notcomments: 'var foo = {}; // do the awesome-ness!\nreturn true;',
  dirtybraces:
    'var a = 0; for(var i=1;i<=10000; i++)\n {\n a += 1;\n }\nreturn a;',
  onelinenewliner:
    'var b=0;\n function f(){b+=1;}\n for(var j=1;j<10000; j++)\n f();\nreturn j;',
  irl3:
    'Todos.Todo = DS.Model.extend({\n title: DS.attr("string"),\n isCompleted: DS.attr("boolean")\n });',
  brackets:
    'var NUM=103, i, sqrt;\nfor(i=2; i<=Math.sqrt(NUM); i+=1){\n if(NUM % i === 0){\n  console.log(NUM + " can be divided by " + i + ".");\n  break;\n }\n}\nreturn i;',
  lotolines:
    'var LIMIT = 10;\nvar num, lastNum, tmp;\nfor(num = 1, lastNum = 0;\n  num < LIMIT;\n  lastNum = num, num = tmp){\n\n    tmp = num + lastNum;\n}\nreturn lastNum;',
  ignorecomments:
    '\n/**\n * This function handles the click for every button.\n *\n * Using the same function reduces code duplication and makes the\n */\nreturn true;',
  dowhile: 'var x=0;\ndo\n {\n x++;\n } while (x < 3);\nreturn x;',
  dowhilenested:
    'var x=0;\n do\n {\n x++;\n var b = 0;\n do {\n b++; \n } while (b < 3);\n } while (x < 3);\nreturn x;',
  infinitedowhile: 'var x=0;\ndo\n {\n x=0;\n } while (x < 3);\n return x;',
  disabled:
    '// noprotect\nvar x=0;\ndo\n {\n x++;\n } while (x < 3);\nreturn x;',
  continues:
    'var n = 0,\n i = 0,\n j = 0;\n \n outside:\n for (i; i < 10; i += 1) {\n for (j; j < 10; j += 1) {\n if (i === 5 && j === 5) {\n continue outside;\n }\n n += 1;\n }\n }\n \n return n;\n;',
  labelWithComment: `label:\n// here be a label\n/*\n and there's some good examples in the loop - poop\n*/\nfor (var i = 0; i < 10; i++) {\n}\nreturn i;`,
  continues2:
    'var x = 0;\nLABEL1: do {\n  x = x + 2;\n  if (x < 100) break LABEL1;\n  if (x < 100) continue LABEL1;\n} \nwhile(0);\n\nreturn x;',
  onelineforinline:
    'function init() {\n  for (var i=0;i<2;i++) (function(n) {\nconsole.log(i)})(i);\n}return true;',
  notlabels:
    'var foo = {\n bar: 1\n };\n \n function doit(i){}\n \n for (var i=0; i<10; i++) {\n doit(i);\n }\n return i;',
  notlabels2: '// Weird:\nfor (var i = 0; i < 10; i++) {}\nreturn i;',
  cs:
    'var bar, foo;\n\nfoo = function(i) {\n  return {\n    id: i\n  };\n};\n\nbar = function(i) {\n\n  var j, _i, _results;\n\n  _results = [];\n  for (j = _i = 1; 1 <= i ? _i < i : _i > i; j = 1 <= i ? ++_i : --_i) {\n    _results.push(j);\n  }\n  return _results;\n};',
  loopbehindif: 'if (false) {for (var i = 1; i--;) {throw Error;}}',
  badloopbehindif: 'if (false) for (var i = 1; i--;) {throw Error;}',
  loopwithoutbody: 'var i = 0;\nwhile(++i < 10);\n return i;',
};

const sinon = {
  spy: fn => jest.fn(fn),
};

var spy;

const loopProtect = code =>
  Babel.transform(new Function(code).toString(), {
    plugins: ['loopProtection'],
  }).code; // eslint-disable-line no-new-func
const run = code => eval(`(${code})()`); // eslint-disable-line no-eval

describe('loop', function() {
  beforeEach(function() {
    spy = sinon.spy(run);
  });

  // https://github.com/jsbin/loop-protect/issues/16
  it('should handle nested for', () => {
    const code = `for (var i = 0; i < 10; i = i + 1) {
          for (var j = 0; j < 10; i = i + 1) {
          }
      }
      return true`;

    const compiled = loopProtect(code);
    assert(run(compiled) === true);
  });

  it('console error when passing string', () => {
    const code = `var i = 0; while (true) i++; return true`;

    const spy = jest.fn();
    global.console.error = spy;

    Babel.registerPlugin(
      'loopProtectionAlt2',
      require('../lib')(100, 'Loop broken')
    );

    const compiled = Babel.transform(new Function(code).toString(), {
      plugins: ['loopProtectionAlt2'],
    }).code; // eslint-disable-line no-new-func
    expect(run(compiled)).toBe(true);
    expect(spy).toHaveBeenCalled();
  });

  it('throws when giving a custom function', () => {
    const code = `var i = 0; while (true) i++; return true`;
    const callback = line => {
      throw new Error(`Bad loop on line ${line}`);
    };

    Babel.registerPlugin('loopProtectionAlt', require('../lib')(100, callback));

    const compiled = Babel.transform(new Function(code).toString(), {
      plugins: ['loopProtectionAlt'],
    }).code; // eslint-disable-line no-new-func

    expect(() => {
      run(compiled);
    }).toThrowError('Bad loop on line 3');
  });

  // https://github.com/jsbin/loop-protect/issues/5
  it('blank line', () => {
    const code = `const log = () => {};while (1)

    log('Hello')
    return true`;

    const compiled = loopProtect(code);
    assert(run(compiled) === true);
  });

  it('with if', () => {
    const code = `if (false) for (var i = 1; i--;) {
      throw Error;
  }

  return true;`;

    const compiled = loopProtect(code);
    assert(run(compiled) === true);
  });

  it('should ignore comments', function() {
    var c = code.ignorecomments;
    var compiled = loopProtect(c);
    // console.log('\n---------\n' + c + '\n---------\n' + compiled);
    var result = run(compiled);
    assert(result === true);
  });

  it('should rewrite for loops', function() {
    var c = code.simplefor;
    var compiled = loopProtect(c);
    assert(compiled !== c);
    var result = run(compiled);
    assert(result === 10);

    c = code.simplefor2;
    compiled = loopProtect(c);
    assert(compiled !== c);
    result = run(compiled);
    assert(result === 10);
  });

  it('should handle one liner for with an inline function', function() {
    var c = code.onelineforinline;
    var compiled = loopProtect(c);
    assert(compiled !== c);
    var result = run(compiled);
    assert(result === true, 'value is ' + result);
  });

  it('should rewrite one line for loops', function() {
    var c = code.onelinefor;
    var compiled = loopProtect(c);
    assert(compiled !== c);
    var result = run(compiled);
    assert(result === 10);

    c = code.onelinefor2;
    compiled = loopProtect(c);
    assert(compiled !== c);

    // console.log('\n---------\n' + c + '\n---------\n' + compiled);

    result = run(compiled);
    assert(result === 0);
  });

  it('should rewrite one line while loops', function() {
    var c = code.onelinewhile2;
    var compiled = loopProtect(c);
    assert(compiled !== c);
    // console.log('\n---------\n' + c + '\n---------\n' + compiled);
    var result = run(compiled);
    assert(result === undefined);
  });

  it('should protect infinite while', function() {
    var c = code.whiletrue;
    var compiled = loopProtect(c);

    assert(compiled !== c);
    assert(spy(compiled) === true);
  });

  it('should protect infinite for', function() {
    var c = code.irl1;
    var compiled = loopProtect(c);
    assert(compiled !== c);
    // assert(spy(compiled) === 0);
  });

  it('should allow nested loops to run', function() {
    var c = code.irl2;
    var compiled = loopProtect(c);
    // console.log('\n---------\n' + c + '\n---------\n' + compiled);
    var r = run(compiled);
    expect(compiled).not.toBe(c);
    expect(r).toBe(60000);
  });

  it('should rewrite loops when curlies are on the next line', function() {
    var c = code.dirtybraces;
    var compiled = loopProtect(c);
    var r = spy(compiled);
    assert(compiled !== c);
    assert(r === 10000, r);
  });

  it('should find one liners on multiple lines', function() {
    var c = code.onelinenewliner;
    var compiled = loopProtect(c);
    var r = spy(compiled);
    // console.log('\n----------');
    // console.log(c);
    // console.log('\n----------');
    // console.log(compiled);
    assert(compiled !== c, compiled);
    assert(r === 10000, 'return value does not match 10000: ' + r);
  });

  it('should handle brackets inside of loop conditionals', function() {
    var c = code.brackets;
    var compiled = loopProtect(c);
    assert(compiled !== c);
    assert(spy(compiled) === 11);
  });

  it('should not corrupt multi-line (on more than one line) loops', function() {
    var c = code.lotolines;
    var compiled = loopProtect(c);
    assert(compiled !== c);
    assert(spy(compiled) === 8);
  });

  it('should protect do loops', function() {
    var c = code.dowhile;
    var compiled = loopProtect(c);
    assert(compiled !== c);
    assert(spy(compiled) === 3);

    c = code.dowhilenested;
    compiled = loopProtect(c);
    // console.log('\n----------');
    // console.log(c);
    // console.log('\n----------');
    // console.log(compiled);
    assert(compiled !== c);
    // assert(spy(compiled) === 3);

    c = code.infinitedowhile;
    compiled = loopProtect(c);
    assert(compiled !== c);
    assert(spy(compiled) === 0);
  });

  it('should handle loop statement without {}', function() {
    var c = code.loopwithoutbody;
    var compiled = loopProtect(c);
    // console.log('\n---------\n' + c + '\n---------\n' + compiled);
    assert(compiled !== c);
    var result = run(compiled);
    assert(result === 10);
  });
});

describe('labels', function() {
  beforeEach(function() {
    spy = sinon.spy(run);
  });

  it('should handle continue statements and gotos', function() {
    var c = code.continues;
    var compiled = loopProtect(c);
    assert(spy(compiled) === 10);

    c = code.continues2;
    compiled = loopProtect(c);
    assert(spy(compiled) === 2);
  });

  it('should handle labels with comments', function() {
    var c = code.labelWithComment;
    var compiled = loopProtect(c);
    assert(spy(compiled) === 10);
  });

  it('should handle things that *look* like labels', function() {
    var c = code.notlabels2;
    var compiled = loopProtect(c);
    assert(compiled !== c);
    var result = run(compiled);
    assert(result === 10, 'actual ' + result);

    c = code.notlabels;
    compiled = loopProtect(c);
    assert(compiled !== c);
    result = run(compiled);
    assert(result === 10, 'actual ' + result);

    // c = code.cs;
    // compiled = loopProtect(c);
    // assert(compiled !== c);
    // result = run(compiled);
    // assert(result === 10, 'actual ' + result);
  });

  it('should handle if statement without {}', function() {
    var c = code.loopbehindif;
    var compiled = loopProtect(c);
    assert(compiled !== c);
    run(compiled);

    c = code.badloopbehindif;
    compiled = loopProtect(c);
    assert(compiled !== c);
    run(compiled);
  });
});
