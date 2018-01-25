const generateBefore = (t, id) =>
  t.variableDeclaration('var', [
    t.variableDeclarator(
      id,
      t.callExpression(
        t.memberExpression(t.identifier('Date'), t.identifier('now')),
        []
      )
    ),
  ]);

const generateInside = ({ t, id, line, ch, timeout, extra } = {}) => {
  return t.ifStatement(
    t.binaryExpression(
      '>',
      t.binaryExpression(
        '-',
        t.callExpression(
          t.memberExpression(t.identifier('Date'), t.identifier('now')),
          []
        ),
        id
      ),
      t.numericLiteral(timeout)
    ),
    extra
      ? t.blockStatement([
          t.expressionStatement(
            t.callExpression(extra, [
              t.numericLiteral(line),
              t.numericLiteral(ch),
            ])
          ),
          t.breakStatement(),
        ])
      : t.breakStatement()
  );
};

const protect = (t, timeout, extra) => path => {
  const id = path.scope.generateUidIdentifier('LP');
  const before = generateBefore(t, id);
  const inside = generateInside({
    t,
    id,
    line: path.node.loc.start.line,
    ch: path.node.loc.start.column,
    timeout,
    extra,
  });
  const body = path.get('body');

  // if we have an expression statement, convert it to a block
  if (t.isExpressionStatement(body)) {
    body.replaceWith(t.blockStatement([body.node]));
  }
  path.insertBefore(before);
  body.unshiftContainer('body', inside);
};

module.exports = (timeout = 100, extra = null) => {
  if (typeof extra === 'string') {
    const string = extra;
    extra = `() => console.error("${string.replace(/"/g, '\\"')}")`;
  } else if (extra !== null) {
    extra = extra.toString();
    if (extra.startsWith('function (')) {
      // fix anonymous functions as they'll cause
      // the callback transform to blow up
      extra = extra.replace(/^function \(/, 'function callback(');
    }
  }

  return ({ types: t, transform }) => {
    const node = extra ? transform(extra).ast.program.body[0] : null;

    let callback = null;
    if (t.isExpressionStatement(node)) {
      callback = node.expression;
    } else if (t.isFunctionDeclaration(node)) {
      callback = t.functionExpression(null, node.params, node.body);
    }

    return {
      visitor: {
        WhileStatement: protect(t, timeout, callback),
        ForStatement: protect(t, timeout, callback),
        DoWhileStatement: protect(t, timeout, callback),
      },
    };
  };
};
