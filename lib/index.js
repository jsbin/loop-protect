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

const generateInside = (t, id, line, timeout) =>
  t.ifStatement(
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
    t.breakStatement()
  );

const protect = (t, timeout) => path => {
  const id = path.scope.generateUidIdentifier('LP');
  const before = generateBefore(t, id);
  const inside = generateInside(t, id, path.node.loc.start.line, timeout);
  const body = path.get('body');

  // if we have an expression statement, convert it to a block
  if (t.isExpressionStatement(body)) {
    body.replaceWith(t.blockStatement([body.node]));
  }
  path.insertBefore(before);
  body.unshiftContainer('body', inside);
};

module.exports = (timeout = 100) => ({ types: t }) => ({
  visitor: {
    WhileStatement: protect(t, timeout),
    ForStatement: protect(t, timeout),
    DoWhileStatement: protect(t, timeout),
  },
});
