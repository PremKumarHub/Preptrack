module.exports = {
  plugins: {
    'postcss-nesting': {},
    'postcss-preset-env': {
      stage: 1,
      features: {
        'nesting-rules': true
      }
    }
  }
}
