import sinonChai from 'sinon-chai'
import chai, { expect } from 'chai'
import babel from '@babel/standalone'
import { stub, SinonStub } from 'sinon'
import autoBreak, { AutoBreakOptions } from './auto-break'

chai.use(sinonChai)

function withAutoBreak(input: string, options?: AutoBreakOptions): Function {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const { code: output } = babel.transform(new Function(input).toString(), {
    plugins: [[autoBreak, { timeout: 50, ...options }]]
  }) ?? { code: null }
  if (output == null) throw new Error(`failed to parse test code ${input}`)
  return () => eval(`(${output})()`) // eslint-disable-line no-eval
}

describe('infinite loops', () => {

  it('breaks from multi-line for loops', () => {
    const run = withAutoBreak(`
      const j = 10
      for (let i = 0; i < Infinity; i++) {
        i = 0
      }
      return j
    `)
    expect(run()).to.equal(10)
  })

  it('breaks from one-line for loops', () => {
    const run = withAutoBreak(`
      let i = 0; let j
      for (; i < Infinity; i++) j = 0
      return j
    `)
    expect(run()).to.equal(0)
  })

  it('breaks from one-line for loops with breaks', () => {
    const run = withAutoBreak(`
      /* eslint-disable */
      let i = 0
      for (i = 0; i < Infinity; ++i) break
      return i
    `)
    expect(run()).to.equal(0)
  })

  it('breaks from while loops', () => {
    const run = withAutoBreak(`
      let i = 0
      while (true) {
        i++
      }
      return true
    `)
    expect(run()).to.equal(true)
  })

  it('breaks from null while loops', () => {
    const run = withAutoBreak(`
      let i = 0
      while (++i);
      return i
    `)
    expect(run()).to.be.above(0)
  })

  it('breaks from nested for loops', () => {
    const run = withAutoBreak(`
      for (let i = 0; i < 10; i = i + 1) {
        for (let j = 0; j < 10; i = i + 1) {

        }
      }
      return true
    `)
    expect(run()).to.equal(true)
  })

  it('breaks from allman-braced loops', () => {
    const run = withAutoBreak(`
      let i = 0
      while (true)
      {
        i++
      }
      return true
    `)
    expect(run()).to.equal(true)
  })

  it('breaks from braceless for loops', () => {
    const run = withAutoBreak(`
      let i = 0
      function f() { i += 1 }
      for (var j = 1; j < 10000;) f()
      return j
    `)
    expect(run()).to.equal(1)
  })

  it('breaks from do while loops', () => {
    const run = withAutoBreak(`
      let i = 0
      do {
        i = 0
      } while (i < 3)
      return i
    `)
    expect(run()).to.equal(0)
  })

})

describe('string error message', () => {

  let consoleError: SinonStub

  beforeEach(() => { consoleError = stub(console, 'error') })
  afterEach(() => consoleError.restore())

  it('logs a custom error message', () => {
    const run = withAutoBreak(`
      while (true);
    `, {
      onBreak: 'oof'
    })
    run()
    expect(consoleError).to.have.been.calledWith('oof')
  })

})

describe('custom callback', () => {

  afterEach(() => delete (global as any).done)

  it('calls a named function', done => {
    (global as any).done = done
    const run = withAutoBreak(`
      while (true);
    `, {
      onBreak: function handleBreak(line: number, column: number): void {
        expect(line).to.be.a('number')
        expect(column).to.be.a('number')
        done()
      }
    })
    run()
  })

  it('calls an anonymous function', done => {
    (global as any).done = done
    const run = withAutoBreak(`
      while (true);
    `, {
      onBreak: function (line: number, column: number): void {
        expect(line).to.be.a('number')
        expect(column).to.be.a('number')
        done()
      }
    })
    run()
  })

  it('calls an arrow function', done => {
    (global as any).done = done
    const run = withAutoBreak(`
      while (true);
    `, {
      onBreak: (line: number, column: number) => {
        expect(line).to.be.a('number')
        expect(column).to.be.a('number')
        done()
      }
    })
    run()
  })

})
