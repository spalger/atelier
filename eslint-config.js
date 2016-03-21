module.exports = {
  parser: 'babel-eslint',
  extends: require.resolve('@spalger/eslint-config-personal/es6'),
  rules: {
    eqeqeq: [2, 'allow-null'],
  },
}
