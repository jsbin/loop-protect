import type BabelCore from '@babel/core'
import {
  ForStatement,
  WhileStatement,
  DoWhileStatement,
  IfStatement,
  Identifier,
  VariableDeclaration,
  FunctionExpression
} from '@babel/types'

type Babel = typeof BabelCore
type Types = typeof BabelCore.types

export type AutoBreakOptions = {
  onBreak?: string | ((line: number, column: number) => unknown)
  timeout?: number
}

export default function autoBreak({ timeout = 2000, onBreak = noop }: AutoBreakOptions = {}) {

  return ({ types: t, transform }: Babel) => {

    const onAutoBreak = transformOnBreak({ t, transform, onBreak })

    return {
      visitor: {
        ForStatement: breakAfter({ t, timeout, onAutoBreak }),
        WhileStatement: breakAfter({ t, timeout, onAutoBreak }),
        DoWhileStatement: breakAfter({ t, timeout, onAutoBreak })
      }
    }
  }
}

type ProtectParams = {
  t: Types
  timeout: number
  onAutoBreak: FunctionExpression
}

type Loop = BabelCore.NodePath<ForStatement | WhileStatement | DoWhileStatement>

function breakAfter({ t, timeout, onAutoBreak }: ProtectParams): (loop: Loop) => void {

  return (loop: Loop) => {

    const { line, column } = loop.node.loc?.start ?? { line: 0, column: 0 }
    const id = loop.scope.generateUidIdentifier('$AB$')

    loop.insertBefore(generateInitialization({ t, id }))

    const loopBody = loop.get('body')
    const loopGuard = generateLoopGuard({ t, id, line, column, timeout, onAutoBreak })

    if (!loopBody.isBlockStatement()) {
      loopBody.replaceWith(t.blockStatement([loopGuard, loopBody.node]))
    } else {
      loopBody.unshiftContainer('body', loopGuard)
    }
  }
}

type InitializationParams = {
  t: Types
  id: Identifier
}

function generateInitialization({ t, id }: InitializationParams): VariableDeclaration {
  return (
    t.variableDeclaration('var', [
      t.variableDeclarator(
        id,
        t.callExpression(
          t.memberExpression(t.identifier('Date'), t.identifier('now')),
          []
        )
      )
    ])
  )
}

type LoopGuardParams = {
  t: Types
  id: Identifier
  line: number
  column: number
  timeout: number
  onAutoBreak: FunctionExpression
}

function generateLoopGuard(
  { t, id, line, column, timeout, onAutoBreak }: LoopGuardParams
): IfStatement {
  return (
    t.ifStatement(
      t.binaryExpression(
        '>',
        t.binaryExpression(
          '-',
          t.callExpression(
            t.memberExpression(
              t.identifier('Date'),
              t.identifier('now')
            ),
            []
          ),
          id
        ),
        t.numericLiteral(timeout)
      ),
      t.blockStatement([
        t.expressionStatement(
          t.callExpression(onAutoBreak, [
            t.numericLiteral(line),
            t.numericLiteral(column)
          ])
        ),
        t.breakStatement()
      ])
    )
  )
}

type TransformOnBreakParams = {
  t: Types
  transform: Babel['transform']
  onBreak: string | ((line: number, column: number) => void)
}

function transformOnBreak({ t, transform, onBreak }: TransformOnBreakParams): FunctionExpression {

  const onAutoBreakCode = typeof onBreak === 'function'
    ? onBreak.toString().replace(/^function\s*\(/, 'function $onAutoBreak$(')
    : `() => console.error("${onBreak.replace(/"/g, '\\"')}")`

  const onAutoBreak = transform(onAutoBreakCode, { ast: true })?.ast?.program.body[0]

  if (t.isExpressionStatement(onAutoBreak)) {
    // ArrowFunctionExpression
    return onAutoBreak.expression as FunctionExpression
  }

  if (t.isFunctionDeclaration(onAutoBreak)) {
    return t.functionExpression(onAutoBreak.id, onAutoBreak.params, onAutoBreak.body)
  }

  /* c8 ignore next */ // should be unreachable
  throw new Error('loop-protect: invalid onBreak action')
}

const noop = function (): void {}
