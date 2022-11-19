import sinonChai from 'sinon-chai'
import chai, { expect } from 'chai'
import babel from '@babel/standalone'
import autoBreak, { AutoBreakOptions } from './auto-break'

chai.use(sinonChai)

function withAutoBreak(input: string, options?: AutoBreakOptions): string {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const { code: output } = babel.transform(new Function(input).toString(), {
    plugins: [autoBreak({ ...options, timeout: 100 })]
  }) ?? { code: null }
  if (output == null) throw new Error(`failed to parse test code ${input}`)
  return output
}

function run(code: string): unknown {
  return eval(`(${code})()`) // eslint-disable-line no-eval
}

describe('infinite loops', () => {

  it('breaks from multi-line for loops', () => {
    const code = withAutoBreak(`
      var j = 10
      for (var i = 0; i < Infinity; i++) {
        i = 0
      }
      return j
    `)
    const result = run(code)
    expect(result).to.equal(10)
  })

  it('breaks from one-line for loops', () => {
    const code = withAutoBreak(`
      var i = 0, j
      for (; i < Infinity; i++) j = 0
      return j
    `)
    const result = run(code)
    expect(result).to.equal(0)
  })

  it('breaks from one-line for loops with breaks', () => {
    const code = withAutoBreak(`
      var i = 0
      for (i = 0; i < Infinity; ++i) break
      return i
    `)
    const result = run(code)
    expect(result).to.equal(0)
  })

  it('breaks from infinite while loops', () => {
    const code = withAutoBreak(`
      var i = 0
      while (true) {
        i++
      }
      return true
    `)
    const result = run(code)
    expect(result).to.equal(true)
  })

  it('breaks from null while loops', () => {
    const code = withAutoBreak(`
      var i = 0
      while (++i);
      return i
    `)
    const result = run(code)
    expect(result).to.be.above(0)
  })

  it('breaks from nested for loops', () => {
    const code = withAutoBreak(`
      for (var i = 0; i < 10; i = i + 1) {
        for (var j = 0; j < 10; i = i + 1) {

        }
      }
      return true
    `)
    const result = run(code)
    expect(result).to.equal(true)
  })

  it('breaks from allman-braced loops', () => {
    const code = withAutoBreak(`
      var i = 0
      while (true)
      {
        i++
      }
      return true
    `)
    const result = run(code)
    expect(result).to.equal(true)
  })

  it('breaks from braceless for loops', () => {
    const code = withAutoBreak(`
      var i = 0
      function f() { i += 1 }
      for (var j = 1; j < 10000;)
        f()
      return j
    `)
    const result = run(code)
    expect(result).to.equal(1)
  })

  it('breaks from do while loops', () => {
    const code = withAutoBreak(`
      var i = 0
      do {
        i = 0
      } while (i < 3)
      return i
    `)
    const result = run(code)
    expect(result).to.equal(0)
  })

})
