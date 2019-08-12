module.exports = {
  extends: ['airbnb', 'prettier', 'prettier/react'],
  env: {
    es6: true,
    browser: true,
    jest: true,
    node: true
  },
  rules: {
    'no-console': 0,
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/prop-types': 0,
    'import/extensions': 0
  },
  plugins: ['react', 'prettier', 'jsx-a11y']
};
