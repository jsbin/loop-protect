'use strict';
/*global describe:true, it: true */
var assert = require('assert');
var loopProtect = require('../lib/loop-protect');

global.loopProtect = loopProtect;

function run(code) {
  var r = (new Function(code))(); // jshint ignore:line
  return r;
}

describe('non-JS Bin use', function () {
  it('should catch infinite loop', function (done) {
    var code = 'var i = 0; while (true) {\ni++;\n}\nreturn "∞"';

    loopProtect.hit = function (line) {
      assert(line === 1, 'Loop found on line ' + line);
      done();
    };

    var processed = loopProtect(code);

    var result = run(processed);
    assert(result === '∞', 'code ran and returned ' + result);
  });
});
