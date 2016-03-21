module.exports = {
  plugins: [
    require.resolve('babel-plugin-transform-class-properties'),

    // es2015
    require.resolve('babel-plugin-check-es2015-constants'),
    require.resolve('babel-plugin-transform-es2015-arrow-functions'),
    require.resolve('babel-plugin-transform-es2015-block-scoped-functions'),
    require.resolve('babel-plugin-transform-es2015-block-scoping'),
    require.resolve('babel-plugin-transform-es2015-classes'),
    require.resolve('babel-plugin-transform-es2015-computed-properties'),
    require.resolve('babel-plugin-transform-es2015-destructuring'),
    require.resolve('babel-plugin-transform-es2015-for-of'),
    require.resolve('babel-plugin-transform-es2015-function-name'),
    require.resolve('babel-plugin-transform-es2015-literals'),
    require.resolve('babel-plugin-transform-es2015-modules-commonjs'),
    require.resolve('babel-plugin-transform-es2015-object-super'),
    require.resolve('babel-plugin-transform-es2015-parameters'),
    require.resolve('babel-plugin-transform-es2015-shorthand-properties'),
    require.resolve('babel-plugin-transform-es2015-spread'),
    require.resolve('babel-plugin-transform-es2015-sticky-regex'),
    require.resolve('babel-plugin-transform-es2015-template-literals'),
    require.resolve('babel-plugin-transform-es2015-typeof-symbol'),
    require.resolve('babel-plugin-transform-es2015-unicode-regex'),
    // 'transform-regenerator',

    // stage 1
    require.resolve('babel-plugin-transform-class-constructor-call'),
    require.resolve('babel-plugin-transform-decorators'),
    require.resolve('babel-plugin-transform-export-extensions'),

    // stage 2
    require.resolve('babel-plugin-syntax-trailing-function-commas'),
    require.resolve('babel-plugin-transform-object-rest-spread'),

    // stage 3
    require.resolve('babel-plugin-transform-async-to-generator'),
    require.resolve('babel-plugin-transform-exponentiation-operator'),
  ],
}
